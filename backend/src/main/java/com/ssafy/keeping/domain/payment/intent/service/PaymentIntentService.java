package com.ssafy.keeping.domain.payment.intent.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.keeping.domain.idempotency.constant.IdemActorType;
import com.ssafy.keeping.domain.idempotency.constant.IdemStatus;
import com.ssafy.keeping.domain.idempotency.dto.IdemBegin;
import com.ssafy.keeping.domain.idempotency.model.IdempotencyKey;
import com.ssafy.keeping.domain.idempotency.model.IdempotentResult;
import com.ssafy.keeping.domain.idempotency.repository.IdempotencyKeyRepository;
import com.ssafy.keeping.domain.idempotency.service.IdempotencyService;
import com.ssafy.keeping.domain.menu.model.Menu;
import com.ssafy.keeping.domain.menu.repository.MenuRepository;
import com.ssafy.keeping.domain.payment.common.IdUtil;
import com.ssafy.keeping.domain.payment.intent.canonical.CanonicalInitiate;
import com.ssafy.keeping.domain.payment.intent.constant.PaymentStatus;
import com.ssafy.keeping.domain.payment.intent.dto.PaymentInitiateItemDto;
import com.ssafy.keeping.domain.payment.intent.dto.PaymentInitiateRequest;
import com.ssafy.keeping.domain.payment.intent.dto.PaymentIntentDetailResponse;
import com.ssafy.keeping.domain.payment.intent.dto.PaymentIntentItemView;
import com.ssafy.keeping.domain.payment.intent.model.PaymentIntent;
import com.ssafy.keeping.domain.payment.intent.model.PaymentIntentItem;
import com.ssafy.keeping.domain.payment.intent.repository.PaymentIntentItemRepository;
import com.ssafy.keeping.domain.payment.intent.repository.PaymentIntentRepository;
import com.ssafy.keeping.domain.payment.qr.constant.QrMode;
import com.ssafy.keeping.domain.payment.qr.constant.QrState;
import com.ssafy.keeping.domain.payment.qr.model.QrToken;
import com.ssafy.keeping.domain.payment.qr.repository.QrTokenRepository;
import com.ssafy.keeping.global.exception.CustomException;
import com.ssafy.keeping.global.exception.constants.ErrorCode;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentIntentService {

    private final PaymentIntentRepository intentRepository;
    private final PaymentIntentItemRepository itemRepository;
    private final QrTokenRepository qrTokenRepository;
    private final MenuRepository menuRepository;

    private final IdempotencyKeyRepository idempotencyKeyRepository;
    private final IdempotencyService idempotencyService;
    @Qualifier("canonicalObjectMapper")
    private final ObjectMapper canonicalObjectMapper;
    private final ObjectMapper objectMapper;
    private final Clock clock;

    /**
     * 결제 의도 생성
     * - 멱등 스코프: (actorType=MERCHANT, actorId=merchantUserId, path=/cpqr/{qrTokenId}/initiate, key=Idempotency-Key)
     * - 상태 흐름:
     *   DONE                           → 저장된 응답 재생(200 OK)
     *   IN_PROGRESS(타 프로세스 선점)     → 202 Accepted
     *   신규                            → 본 처리 수행 → DONE 기록 후 201 Created
     */
    @Transactional
    public IdempotentResult<PaymentIntentDetailResponse> initiate(UUID qrTokenId,
                                                                  String idempotencyKeyHeader,
                                                                  Long ownerId,
                                                                  PaymentInitiateRequest req) {

        if (req == null || req.getOrderItems() == null || req.getOrderItems().isEmpty()) {
            throw new CustomException(ErrorCode.PAYMENT_INIT_ORDER_EMPTY);
        }
        if (req.getStoreId() == null) {
            throw new CustomException(ErrorCode.PAYMENT_INIT_STORE_ID_REQUIRED);
        }
        if (idempotencyKeyHeader == null || idempotencyKeyHeader.isBlank()) {
            throw new CustomException(ErrorCode.IDEMPOTENCY_KEY_REQUIRED);
        }

        // 멱등 바디 정규화 → SHA-256
        String canonicalBody = canonicalizeInitiateBody(req); // 정규화
        byte[] bodyHash = IdempotencyService.sha256(canonicalBody); // SHA-256

        // 멱등 선점 또는 로드
        UUID keyUuid = UUID.fromString(idempotencyKeyHeader);
        String path = "/cpqr/" + qrTokenId + "/initiate"; // 스코프 정규화
        IdemBegin begin = idempotencyService.beginOrLoad(IdemActorType.MERCHANT, ownerId, "POST", path, keyUuid, bodyHash);

        // slotOpt이 비어있는지 확인
//        IdempotencyKey slot = slotOpt.orElseThrow(() -> new RuntimeException("Idempotency begin failed"));

        IdempotencyKey slot = begin.getRow();

        // 본문 충돌 확인
        if (idempotencyService.isBodyConflict(slot, bodyHash)) {
            throw new CustomException(ErrorCode.IDEMPOTENCY_BODY_CONFLICT);
        }

        if (slot.getStatus() == IdemStatus.DONE) {
            // 스냅샷이 있으면 그대로, 없으면 리소스 재조회해서 응답 구성
            PaymentIntentDetailResponse replay;
            if (slot.getResponseJson() != null) {
                replay = parseSnapshot(slot.getResponseJson());
            } else if (slot.getIntentPublicId() != null) {
                replay = rebuildFromResource(slot.getIntentPublicId());
            } else {
                // 최소한의 폴백 (실무에선 거의 안탐)
                throw new CustomException(ErrorCode.IDEMPOTENCY_REPLAY_UNAVAILABLE);
            }
            return IdempotentResult.okReplay(replay);
        }

        // 다른 처리에서 IN_PROGRESS로 선점
        if (!begin.isCreated() && slot.getStatus() == IdemStatus.IN_PROGRESS) {
            return IdempotentResult.acceptedWithRetryAfterSeconds(2);
        }

        // QR 검증 - QrState가 ISSUED(발급됨)이어야 한다.
        QrToken qr = qrTokenRepository.findByQrTokenIdAndState(qrTokenId, QrState.ISSUED)
                .orElseThrow(() -> new CustomException(ErrorCode.QR_NOT_FOUND));
        LocalDateTime now = LocalDateTime.now(clock);
        if (qr.getExpiresAt() != null && now.isAfter(qr.getExpiresAt())) {
            throw new CustomException(ErrorCode.QR_EXPIRED);
        }
        if (qr.getMode() != QrMode.CPQR) {
            throw new CustomException(ErrorCode.QR_MODE_UNSUPPORTED);
        }
        if (!Objects.equals(qr.getBindStoreId(), req.getStoreId())) {
            throw new CustomException(ErrorCode.QR_STORE_MISMATCH);
        }

        // TODO: ownerId 소속 매장 검증 로직


        // 메뉴 로딩/검증
        Set<Long> uniqueMenuIds = new LinkedHashSet<>();
        for (PaymentInitiateItemDto item : req.getOrderItems()) {
            uniqueMenuIds.add(item.getMenuId());
        }

        List<Long> menuIdList = new ArrayList<>(uniqueMenuIds);

        List<Menu> menus = menuRepository.findAllById(menuIdList);
        if (menus.size() != uniqueMenuIds.size()) {
            throw new CustomException(ErrorCode.MENU_NOT_FOUND);
        }
        Map<Long, Menu> menuById = new HashMap<>();
        for (Menu m : menus) {
            menuById.put(m.getMenuId(), m);
        }

        for (Menu m : menus) {
            Long menuStoreId = m.getStore().getStoreId();
            if (!Objects.equals(menuStoreId, req.getStoreId())) {
                throw new CustomException(ErrorCode.MENU_CROSS_STORE_CONFLICT);
            }
            if (!m.isActive() || m.isSoldOut()) {
                throw new CustomException(ErrorCode.MENU_UNAVAILABLE);
            }
        }

        // 합계 계산
        long total = 0L;
        for (PaymentInitiateItemDto item : req.getOrderItems()) {
            Menu m = menuById.get(item.getMenuId());
            if (item.getQuantity() <= 0) throw new CustomException(ErrorCode.PAYMENT_INIT_QUANTITY_INVALID);
            total += (long) m.getPrice() * item.getQuantity();
        }

        // Intent 생성
        PaymentIntent intent = PaymentIntent.builder()
                .publicId(IdUtil.newUuidV7())
                .qrToken(qr)
                .customerId(qr.getCustomerId())
                .storeId(req.getStoreId())
                .amount(total)
                .status(PaymentStatus.PENDING)
                .createdAt(now)
                .updatedAt(now)
                .expiresAt(now.plusMinutes(3))
                .idempotencyKey(idempotencyKeyHeader)
                .build();

        intent = intentRepository.save(intent);

        // 아이템 스냅샷 저장
        List<PaymentIntentItem> items = new ArrayList<>();
        for (PaymentInitiateItemDto item : req.getOrderItems()) {
            Menu m = menuById.get(item.getMenuId());
            PaymentIntentItem row = PaymentIntentItem.builder()
                    .intent(intent)
                    .menuId(m.getMenuId())
                    .menuNameSnap(m.getMenuName())
                    .unitPriceSnap(m.getPrice())
                    .quantity(item.getQuantity())
                    .build();
            items.add(row);
        }
        itemRepository.saveAll(items);

        // 응답 구성
        List<PaymentIntentItemView> itemViews = new ArrayList<>();
        for (PaymentIntentItem it : items) {
            itemViews.add(toItemView(it));
        }
        PaymentIntentDetailResponse res = PaymentIntentDetailResponse.from(intent, itemViews);

        // 멱등 완료 기록(DONE + 응답 스냅샷)
        idempotencyService.complete(slot, HttpStatus.CREATED.value(), res, intent.getPublicId());

        return IdempotentResult.created(res);
    }

    @Transactional(readOnly = true)
    public PaymentIntentDetailResponse getDetail(UUID intentPublicId) {
        PaymentIntent intent = intentRepository.findByPublicId(intentPublicId)
                .orElseThrow(() -> new CustomException(ErrorCode.PAYMENT_INTENT_NOT_FOUND));
        List<PaymentIntentItem> rows = itemRepository.findByIntent_IntentId(intent.getIntentId());
        List<PaymentIntentItemView> itemViews = new ArrayList<>();
        for (PaymentIntentItem it : rows) {
            itemViews.add(toItemView(it)); // 또는 this.toItemView(it)
        }
        return PaymentIntentDetailResponse.from(intent, itemViews);
    }

    /* ---------- 내부 유틸 ---------- */

    private PaymentIntentItemView toItemView(PaymentIntentItem it) {
        long line = (it.getLineTotal() != null) ? it.getLineTotal() : it.getUnitPriceSnap() * it.getQuantity();
        return PaymentIntentItemView.builder()
                .menuId(it.getMenuId())
                .name(it.getMenuNameSnap())
                .unitPrice(it.getUnitPriceSnap())
                .quantity(it.getQuantity())
                .lineTotal(line)
                .build();
    }

    /** initiate 요청 바디 정규화 (키 정렬 + 공백 제거 등: ObjectMapper 설정에 따름) */
    private String canonicalizeInitiateBody(PaymentInitiateRequest req) {

        // 아이템 정규화: menuId 오름차순, 같으면 quantity 오름차순
        List<CanonicalInitiate.Item> normItems = new ArrayList<>();
        for (PaymentInitiateItemDto it : req.getOrderItems()) {
            if (it.getQuantity() <= 0) {
                throw new CustomException(ErrorCode.PAYMENT_INIT_QUANTITY_INVALID);
            }
            CanonicalInitiate.Item ci = CanonicalInitiate.Item.builder()
                    .menuId(it.getMenuId())
                    .quantity(it.getQuantity())
                    .build();
            normItems.add(ci);
        }
        normItems.sort((a, b) -> {
            int c = a.getMenuId().compareTo(b.getMenuId());
            if (c != 0) return c;
            return Integer.compare(a.getQuantity(), b.getQuantity());
        });

        // 캔노니컬 DTO 구성(필드 순서 고정)
        CanonicalInitiate canonical = CanonicalInitiate.builder()
                .storeId(req.getStoreId())
                .items(normItems)
                .build();

        try {
            return canonicalObjectMapper.writeValueAsString(canonical);
        } catch (com.fasterxml.jackson.core.JsonProcessingException e) {
            // 바디 정규화 실패 시, 의미상 동일 비교가 불가
            throw new CustomException(ErrorCode.REQUEST_CANONICALIZE_FAILED);
        }
    }

    /** 스냅샷 JSON → DTO */
    private PaymentIntentDetailResponse parseSnapshot(String json) {
        try {
            byte[] bytes = json.getBytes(StandardCharsets.UTF_8);
            return objectMapper.readValue(bytes, PaymentIntentDetailResponse.class);
        } catch (Exception e) {
            // 스냅샷 파싱이 불가능하면 리소스 재조회를 시도하도록 위에서 폴백 처리
            throw new CustomException(ErrorCode.RESPONSE_SNAPSHOT_PARSE_FAILED);
        }
    }

    /** intent_public_id로 리소스를 재조회하여 응답 재구성 (스냅샷 없을 때 폴백) */
    private PaymentIntentDetailResponse rebuildFromResource(UUID intentPublicId) {
        return getDetail(intentPublicId);
    }

}