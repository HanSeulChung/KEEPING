package com.ssafy.keeping.domain.wallet.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.ssafy.keeping.domain.idempotency.constant.IdemActorType;
import com.ssafy.keeping.domain.idempotency.constant.IdemStatus;
import com.ssafy.keeping.domain.idempotency.dto.IdemBegin;
import com.ssafy.keeping.domain.idempotency.model.IdempotencyKey;
import com.ssafy.keeping.domain.idempotency.model.IdempotentResult;
import com.ssafy.keeping.domain.idempotency.service.IdempotencyService;
import com.ssafy.keeping.domain.user.customer.model.Customer;
import com.ssafy.keeping.domain.user.customer.repository.CustomerRepository;
import com.ssafy.keeping.domain.wallet.constant.LotSourceType;
import com.ssafy.keeping.domain.wallet.constant.WalletType;
import com.ssafy.keeping.domain.wallet.dto.WalletResponseDto;
import com.ssafy.keeping.domain.wallet.model.Wallet;
import com.ssafy.keeping.domain.wallet.repository.WalletRepository;
import com.ssafy.keeping.domain.group.model.Group;
import com.ssafy.keeping.domain.group.repository.GroupMemberRepository;
import com.ssafy.keeping.domain.group.repository.GroupRepository;
import com.ssafy.keeping.domain.store.model.Store;
import com.ssafy.keeping.domain.store.repository.StoreRepository;
import com.ssafy.keeping.global.exception.CustomException;
import com.ssafy.keeping.global.exception.constants.ErrorCode;
import com.ssafy.keeping.domain.payment.transactions.repository.TransactionRepository;
import com.ssafy.keeping.domain.wallet.repository.WalletStoreBalanceRepository;
import com.ssafy.keeping.domain.wallet.repository.WalletStoreLotRepository;
import com.ssafy.keeping.domain.wallet.dto.WalletStoreBalanceResponseDto;
import com.ssafy.keeping.domain.wallet.dto.PointShareResponseDto;
import com.ssafy.keeping.domain.wallet.dto.PointShareRequestDto;
import com.ssafy.keeping.domain.wallet.dto.PersonalWalletBalanceResponseDto;
import com.ssafy.keeping.domain.wallet.dto.GroupWalletBalanceResponseDto;
import com.ssafy.keeping.domain.wallet.dto.WalletStoreBalanceDetailDto;
import com.ssafy.keeping.domain.wallet.dto.WalletStoreDetailResponseDto;
import com.ssafy.keeping.domain.wallet.dto.WalletStoreTransactionDetailDto;
import com.ssafy.keeping.domain.wallet.model.WalletStoreBalance;
import com.ssafy.keeping.domain.wallet.model.WalletStoreLot;
import com.ssafy.keeping.domain.payment.transactions.model.Transaction;
import com.ssafy.keeping.domain.payment.transactions.constant.TransactionType;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WalletServiceHS { // 충돌나는 것을 방지해 HS를 붙였으나 추후 합치겠습니다.
    private final StoreRepository storeRepository;
    private final WalletRepository walletRepository;
    private final WalletStoreBalanceRepository balanceRepository;
    private final GroupRepository groupRepository;
    private final CustomerRepository customerRepository;
    private final TransactionRepository transactionRepository;
    private final WalletStoreLotRepository lotRepository;
    private final GroupMemberRepository groupMemberRepository;

    private final IdempotencyService idempotencyService;
    @Qualifier("canonicalObjectMapper")
    private final ObjectMapper canonicalObjectMapper;


    public WalletResponseDto createGroupWallet(Group group) {

        Wallet saved = walletRepository.save(
                Wallet.builder()
                        .walletType(WalletType.GROUP)
                        .group(group)
                        .build()
        );

        return new WalletResponseDto(
                saved.getWalletId(), saved.getWalletType(),
                group.getGroupId(),
                new ArrayList<>(),
                saved.getCreatedAt()
        );
    }

    // Group 엔티티가 이미 있는 호출용
    public WalletResponseDto getGroupWallet(Group group) {

        Wallet groupWallet = walletRepository.findByGroupId(group.getGroupId())
                .orElseThrow(() -> new CustomException(ErrorCode.WALLET_NOT_FOUND));

        List<WalletStoreBalanceResponseDto> groupStoreBalanceDtoList =
                Optional.ofNullable(groupWallet.getWalletStoreBalances())
                        .orElseGet(Collections::emptyList)
                        .stream()
                        .map(b -> new WalletStoreBalanceResponseDto(
                                b.getBalanceId(),
                                b.getBalance(),
                                b.getUpdatedAt()
                        ))
                        .toList();

        return new WalletResponseDto(
                groupWallet.getWalletId(),
                groupWallet.getWalletType(),
                group.getGroupId(),
                groupStoreBalanceDtoList,
                groupWallet.getCreatedAt()
        );
    }
    // id만 넘어오는 호출용(검증을 여기서 직접 수행)
    public WalletResponseDto getGroupWallet(Long groupId, Long customerId) {
        if (!customerRepository.existsById(customerId)) {
            throw new CustomException(ErrorCode.USER_NOT_FOUND);
        }
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new CustomException(ErrorCode.GROUP_NOT_FOUND));


        Wallet groupWallet = walletRepository.findByGroupId(group.getGroupId())
                .orElseThrow(() -> new CustomException(ErrorCode.WALLET_NOT_FOUND));

        List<WalletStoreBalanceResponseDto> groupStoreBalanceDtoList =
                Optional.ofNullable(groupWallet.getWalletStoreBalances())
                        .orElseGet(Collections::emptyList)
                        .stream()
                        .map(b -> new WalletStoreBalanceResponseDto(
                                b.getBalanceId(),
                                b.getBalance(),
                                b.getUpdatedAt()
                        ))
                        .toList();

        return new WalletResponseDto(
                groupWallet.getWalletId(),
                groupWallet.getWalletType(),
                group.getGroupId(),
                groupStoreBalanceDtoList,
                groupWallet.getCreatedAt()
        );
    }

    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    public IdempotentResult<PointShareResponseDto> sharePoints(
            Long groupId, Long userId, Long storeId, String idemKeyHeader, @Valid PointShareRequestDto req) {

        if (req == null) throw new CustomException(ErrorCode.BAD_REQUEST);
        if (idemKeyHeader == null || idemKeyHeader.isBlank())
            throw new CustomException(ErrorCode.IDEMPOTENCY_KEY_REQUIRED);

        // 바디 정규화 + 해시
        String canonicalBody = canonicalizeShareBody(groupId, userId, storeId, req);
        byte[] bodyHash = IdempotencyService.sha256(canonicalBody);

        UUID keyUuid = UUID.fromString(idemKeyHeader);
        String path = "/groups/" + groupId + "/stores/" + storeId;

        IdemBegin begin = idempotencyService.beginOrLoad(
                IdemActorType.CUSTOMER, userId, "POST", path, keyUuid, bodyHash);
        IdempotencyKey slot = begin.getRow();

        // 본문 충돌
        if (idempotencyService.isBodyConflict(slot, bodyHash)) {
            throw new CustomException(ErrorCode.IDEMPOTENCY_BODY_CONFLICT);
        }

        // DONE → 재생
        if (slot.getStatus() == IdemStatus.DONE) {
            JsonNode snap = slot.getResponseJson();
            if (snap == null) throw new CustomException(ErrorCode.IDEMPOTENCY_REPLAY_UNAVAILABLE);
            PointShareResponseDto replay = parseSnapshot(snap);
            return IdempotentResult.okReplay(replay);
        }

        // 타 트랜잭션 IN_PROGRESS 선점 → 202
        if (!begin.isCreated() && slot.getStatus() == IdemStatus.IN_PROGRESS) {
            return IdempotentResult.acceptedWithRetryAfterSeconds(2);
        }

        // 실제 처리
        PointShareResponseDto created = doSharePoints(groupId, userId, storeId, req);

        // 완료 기록(DONE) + 스냅샷
        idempotencyService.completeCharge(slot, HttpStatus.CREATED.value(), created);

        return IdempotentResult.created(created);
    }

    // ===== 실제 처리 본문  =====
    @Transactional
    protected PointShareResponseDto doSharePoints(Long groupId, Long userId, Long storeId, @Valid PointShareRequestDto req) {
        // 1) 입력·기본 엔티티 조회
        final long shareAmount = req.getShareAmount();
        if (shareAmount <= 0) throw new CustomException(ErrorCode.BAD_REQUEST);

        Customer actor = customerRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        Wallet individual = validWallet(req.getIndividualWalletId());
        Wallet group = validWallet(req.getGroupWalletId());
        if (individual.getWalletType() != WalletType.INDIVIDUAL || group.getWalletType() != WalletType.GROUP)
            throw new CustomException(ErrorCode.BAD_REQUEST);
        ensureOwnershipAndMembership(userId, groupId, individual, group);

        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new CustomException(ErrorCode.STORE_NOT_FOUND));

        // 2) 잔액 행잠금 조회
        WalletStoreBalance indivBal = balanceRepository.lockByWalletIdAndStoreId(individual.getWalletId(), storeId)
                .orElseThrow(() -> new CustomException(ErrorCode.BEFORE_INDIVIDUAL_CHARGE));
        if (indivBal.getBalance().compareTo(shareAmount) < 0)
            throw new CustomException(ErrorCode.OVER_INDIVIDUAL_POINT);

        WalletStoreBalance groupBal = balanceRepository.lockByWalletIdAndStoreId(group.getWalletId(), storeId)
                .orElseGet(() -> balanceRepository.save(
                        WalletStoreBalance.builder().wallet(group).store(store).balance(0L).build()
                ));

        // 3) LOT 차감 및 수신 LOT 적립(FIFO)
        Long shareLeft = shareAmount;
        List<WalletStoreLot> lots = lotRepository.lockAllByWalletIdAndStoreIdOrderByAcquiredAt(individual.getWalletId(), storeId);
        for (WalletStoreLot src : lots) {
            if (shareLeft == 0) break;
            if (src.isExpired() || src.isFullyUsed()) continue;

            Long movable = Math.min(src.getAmountRemaining(), shareLeft);
            if (movable == 0) continue;

            src.usePoints(movable);               // 개인 LOT 차감
            shareLeft -= movable;

            // 수신 LOT: 동일 origin_charge_tx 기준으로 1개에 누적
            WalletStoreLot dst = lotRepository
                    .findByWalletIdAndStoreIdAndOriginChargeTxIdAndSourceType(
                            group.getWalletId(),
                            storeId,
                            src.getOriginChargeTransaction().getTransactionId(),
                            LotSourceType.TRANSFER_IN
                    )
                    .orElseGet(() -> lotRepository.save(
                            WalletStoreLot.builder()
                                    .wallet(group)
                                    .store(store)
                                    .amountTotal(0L)
                                    .amountRemaining(0L)
                                    .acquiredAt(src.getAcquiredAt())
                                    .expiredAt(src.getExpiredAt())
                                    .sourceType(LotSourceType.TRANSFER_IN)
                                    .contributorWallet(individual)
                                    .originChargeTransaction(src.getOriginChargeTransaction())
                                    .build()
                    ));
            dst.sharePoints(movable); // 총액·잔량 가산
        }
        if (shareLeft != 0) throw new CustomException(ErrorCode.INCONSISTENT_STATE);

        // 4) 잔액 이동
        indivBal.subtractBalance(shareAmount);
        groupBal.addBalance(shareAmount);

        // 5) 거래기록 2건(반드시 store 세팅)
        Transaction txOut = transactionRepository.save(
                Transaction.builder()
                        .wallet(individual)
                        .relatedWallet(group)
                        .customer(actor)
                        .store(store)
                        .transactionType(TransactionType.USE)
                        .amount(shareAmount)
                        .build()
        );
        Transaction txIn = transactionRepository.save(
                Transaction.builder()
                        .wallet(group) // 수신 지갑
                        .relatedWallet(individual)
                        .customer(actor)
                        .store(store)
                        .transactionType(TransactionType.TRANSFER_IN)
                        .amount(shareAmount)
                        .build()
        );

        return new PointShareResponseDto(
                txOut.getTransactionId(), txIn.getTransactionId(),
                individual.getWalletId(), group.getWalletId(), storeId, shareAmount,
                groupBal.getBalance(), indivBal.getBalance(), LocalDateTime.now(), false
        );
    }

    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    public IdempotentResult<PointShareResponseDto> reclaimPoints(
            Long groupId, Long userId, Long storeId, String idemKeyHeader, @Valid PointShareRequestDto req) {

        if (req == null) throw new CustomException(ErrorCode.BAD_REQUEST);
        if (idemKeyHeader == null || idemKeyHeader.isBlank())
            throw new CustomException(ErrorCode.IDEMPOTENCY_KEY_REQUIRED);

        String canonicalBody = canonicalizeReclaimBody(groupId, userId, storeId, req);
        byte[] bodyHash = IdempotencyService.sha256(canonicalBody);

        UUID keyUuid = UUID.fromString(idemKeyHeader);
        String path = "/groups/" + groupId + "/stores/" + storeId + "/reclaim";

        IdemBegin begin = idempotencyService.beginOrLoad(
                IdemActorType.CUSTOMER, userId, "POST", path, keyUuid, bodyHash);
        IdempotencyKey slot = begin.getRow();

        if (idempotencyService.isBodyConflict(slot, bodyHash)) {
            throw new CustomException(ErrorCode.IDEMPOTENCY_BODY_CONFLICT);
        }

        if (slot.getStatus() == IdemStatus.DONE) {
            PointShareResponseDto replay = parseSnapshot(slot.getResponseJson());
            return IdempotentResult.okReplay(replay);
        }

        if (!begin.isCreated() && slot.getStatus() == IdemStatus.IN_PROGRESS) {
            return IdempotentResult.acceptedWithRetryAfterSeconds(2);
        }

        PointShareResponseDto created = doReclaimPoints(groupId, userId, storeId, req);

        idempotencyService.completeCharge(slot, HttpStatus.CREATED.value(), created);
        return IdempotentResult.created(created);
    }

    // 실제 회수 처리
    @Transactional
    protected PointShareResponseDto doReclaimPoints(Long groupId, Long userId, Long storeId, @Valid PointShareRequestDto req) {
        final long amount = req.getShareAmount(); // 재사용
        if (amount <= 0) throw new CustomException(ErrorCode.BAD_REQUEST);

        Customer actor = customerRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        Wallet individual = validWallet(req.getIndividualWalletId());
        Wallet group = validWallet(req.getGroupWalletId());
        if (individual.getWalletType() != WalletType.INDIVIDUAL || group.getWalletType() != WalletType.GROUP)
            throw new CustomException(ErrorCode.BAD_REQUEST);
        ensureOwnershipAndMembership(userId, groupId, individual, group);

        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new CustomException(ErrorCode.STORE_NOT_FOUND));

        // 잔액 행잠금
        WalletStoreBalance indivBal = balanceRepository.lockByWalletIdAndStoreId(individual.getWalletId(), storeId)
                .orElseGet(() -> balanceRepository.save(
                        WalletStoreBalance.builder().wallet(individual).store(store).balance(0L).build()
                ));
        WalletStoreBalance groupBal = balanceRepository.lockByWalletIdAndStoreId(group.getWalletId(), storeId)
                .orElseThrow(() -> new CustomException(ErrorCode.BEFORE_GROUP_CHARGE)); // 그룹에 해당 매장 잔액이 있어야 함
        if (groupBal.getBalance().compareTo(amount) < 0)
            throw new CustomException(ErrorCode.OVER_GROUP_POINT);

        // LOT 회수: 그룹 → 개인, FIFO
        Long left = amount;
        List<WalletStoreLot> srcLots =
                lotRepository.lockAllByWalletIdAndStoreIdOrderByAcquiredAt(group.getWalletId(), storeId);
        for (WalletStoreLot src : srcLots) {
            if (left == 0) break;
            if (src.isExpired() || src.isFullyUsed()) continue;

            // 개인이 기여한 LOT만 회수하도록 제한(선택). 필요 없으면 이 if 제거.
            if (src.getContributorWallet() != null
                    && !src.getContributorWallet().getWalletId().equals(individual.getWalletId())) {
                continue;
            }

            Long movable = Math.min(src.getAmountRemaining(), left);
            if (movable == 0) continue;

            // 그룹 LOT 차감
            src.usePoints(movable);
            left -= movable;

            // 개인 LOT 누적: origin_charge_tx 기준 1개에 합산
            WalletStoreLot dst = lotRepository
                    .findByWalletIdAndStoreIdAndOriginChargeTxIdAndSourceType(
                            individual.getWalletId(),
                            storeId,
                            src.getOriginChargeTransaction().getTransactionId(),
                            LotSourceType.TRANSFER_IN // 내부 이관은 TRANSFER_IN 재사용
                    )
                    .orElseGet(() -> lotRepository.save(
                            WalletStoreLot.builder()
                                    .wallet(individual)
                                    .store(store)
                                    .amountTotal(0L)
                                    .amountRemaining(0L)
                                    .acquiredAt(src.getAcquiredAt())
                                    .expiredAt(src.getExpiredAt())
                                    .sourceType(LotSourceType.TRANSFER_IN)
                                    .contributorWallet(group) // 출처 표기
                                    .originChargeTransaction(src.getOriginChargeTransaction())
                                    .build()
                    ));
            dst.sharePoints(movable);
        }
        if (left != 0) throw new CustomException(ErrorCode.INCONSISTENT_STATE);

        // 잔액 이동: 그룹 감소, 개인 증가
        groupBal.subtractBalance(amount);
        indivBal.addBalance(amount);

        // 거래 기록 2건
        Transaction txOut = transactionRepository.save(
                Transaction.builder()
                        .wallet(group)
                        .relatedWallet(individual)
                        .customer(actor)
                        .store(store)
                        .transactionType(TransactionType.USE)           // 그룹에서 차감
                        .amount(amount)
                        .build()
        );
        Transaction txIn = transactionRepository.save(
                Transaction.builder()
                        .wallet(individual)
                        .relatedWallet(group)
                        .customer(actor)
                        .store(store)
                        .transactionType(TransactionType.TRANSFER_IN)   // 개인으로 유입
                        .amount(amount)
                        .build()
        );

        return new PointShareResponseDto(
                txOut.getTransactionId(), txIn.getTransactionId(),
                individual.getWalletId(), group.getWalletId(), storeId, amount,
                groupBal.getBalance(), indivBal.getBalance(), LocalDateTime.now(), false
        );
    }

    // ===== Helpers =====
    private String canonicalizeShareBody(Long groupId, Long userId, Long storeId, PointShareRequestDto req) {
        // 키 순서 고정 직렬화
        ObjectNode n = canonicalObjectMapper.createObjectNode();
        n.put("groupId", groupId);
        n.put("userId", userId);
        n.put("storeId", storeId);
        n.put("individualWalletId", req.getIndividualWalletId());
        n.put("groupWalletId", req.getGroupWalletId());
        n.put("shareAmount", req.getShareAmount());
        return n.toString();
    }

    // === canonical helpers ===
    private String canonicalizeReclaimBody(Long groupId, Long userId, Long storeId, PointShareRequestDto req) {
        ObjectNode n = canonicalObjectMapper.createObjectNode();
        n.put("groupId", groupId);
        n.put("userId", userId);
        n.put("storeId", storeId);
        n.put("individualWalletId", req.getIndividualWalletId());
        n.put("groupWalletId", req.getGroupWalletId());
        n.put("reclaimAmount", req.getShareAmount()); // 필드 재사용
        return n.toString();
    }

    private PointShareResponseDto parseSnapshot(JsonNode snap) {
        try {
            return canonicalObjectMapper.treeToValue(snap, PointShareResponseDto.class);
        } catch (Exception e) {
            throw new CustomException(ErrorCode.IDEMPOTENCY_REPLAY_UNAVAILABLE);
        }
    }

    @Transactional(readOnly = true)
    public long getMemberSharedBalance(Group group, Long customerId) {
        Wallet groupWallet = walletRepository.findByGroupId(group.getGroupId())
                .orElseThrow(() -> new CustomException(ErrorCode.WALLET_NOT_FOUND));

        // 해당 사용자가 기여한 lot 중 아직 남아있는 양만 합산
        List<WalletStoreLot> lots = lotRepository
                .findActiveByWalletIdAndContributorCustomerId(groupWallet.getWalletId(), customerId);

        return lots.stream()
                .mapToLong(WalletStoreLot::getAmountRemaining)
                .sum();
    }


    @Transactional
    public void settleShareToIndividual(Group group, Long customerId) {
        Wallet groupWallet = walletRepository.findByGroupId(group.getGroupId())
                .orElseThrow(() -> new CustomException(ErrorCode.WALLET_NOT_FOUND));

        if (!groupMemberRepository.existsMember(group.getGroupId(), customerId)) {
            throw new CustomException(ErrorCode.ONLY_GROUP_MEMBER);
        }

        // 해당 모임원이 기여한 group LOT 스냅샷
        List<WalletStoreLot> srcLots = lotRepository
                .findActiveByWalletIdAndContributorCustomerId(groupWallet.getWalletId(), customerId);

        if (srcLots.isEmpty()) return;

        Wallet individual = srcLots.get(0).getContributorWallet();
        if (individual == null || individual.getCustomer() == null ||
                !individual.getCustomer().getCustomerId().equals(customerId)) {
            throw new CustomException(ErrorCode.INCONSISTENT_STATE);
        }

        // storeId 단위로 묶어서 balance 맞춰 회수
        Map<Long, List<WalletStoreLot>> byStore =
                srcLots.stream().collect(Collectors.groupingBy(l -> l.getStore().getStoreId()));

        for (Map.Entry<Long, List<WalletStoreLot>> entry : byStore.entrySet()) {
            Long storeId = entry.getKey();
            Store store = storeRepository.findById(storeId)
                    .orElseThrow(() -> new CustomException(ErrorCode.STORE_NOT_FOUND));

            WalletStoreBalance groupBal = balanceRepository
                    .lockByWalletIdAndStoreId(groupWallet.getWalletId(), storeId)
                    .orElseThrow(() -> new CustomException(ErrorCode.WALLET_NOT_FOUND));
            WalletStoreBalance indivBal = balanceRepository
                    .lockByWalletIdAndStoreId(individual.getWalletId(), storeId)
                    .orElseGet(() -> balanceRepository.save(
                            WalletStoreBalance.builder().wallet(individual).store(store).balance(0L).build()
                    ));

            long movedSum = 0L;

            for (WalletStoreLot src : entry.getValue()) {
                long remain = src.getAmountRemaining();
                if (remain <= 0) continue;

                // 그룹 LOT 소진
                src.usePoints(remain);

                // 개인 LOT 증가 (originChargeTx 단위 합침)
                WalletStoreLot dst = lotRepository
                        .findByWalletIdAndStoreIdAndOriginChargeTxIdAndSourceType(
                                individual.getWalletId(),
                                storeId,
                                src.getOriginChargeTransaction().getTransactionId(),
                                LotSourceType.TRANSFER_IN
                        )
                        .orElseGet(() -> lotRepository.save(
                                WalletStoreLot.builder()
                                        .wallet(individual).store(store)
                                        .amountTotal(0L).amountRemaining(0L)
                                        .acquiredAt(src.getAcquiredAt())
                                        .expiredAt(src.getExpiredAt())
                                        .sourceType(LotSourceType.TRANSFER_IN)
                                        .contributorWallet(groupWallet)
                                        .originChargeTransaction(src.getOriginChargeTransaction())
                                        .build()
                        ));
                dst.sharePoints(remain);

                // 거래 기록
                transactionRepository.save(Transaction.builder()
                        .wallet(individual).relatedWallet(groupWallet)
                        .customer(individual.getCustomer()).store(store)
                        .transactionType(TransactionType.TRANSFER_IN).amount(remain).build());

                transactionRepository.save(Transaction.builder()
                        .wallet(groupWallet).relatedWallet(individual)
                        .customer(individual.getCustomer()).store(store)
                        .transactionType(TransactionType.USE).amount(remain).build());

                movedSum += remain;
            }

            if (movedSum > 0) {
                if (groupBal.getBalance() < movedSum) {
                    throw new CustomException(ErrorCode.INCONSISTENT_STATE);
                }
                groupBal.subtractBalance(movedSum);
                indivBal.addBalance(movedSum);
            }
        }
    }

    private Wallet validWallet(Long walletId) {
        return walletRepository.findById(walletId)
                .orElseThrow(() -> new CustomException(ErrorCode.WALLET_NOT_FOUND));
    }

    private void ensureOwnershipAndMembership(Long userId, Long groupId, Wallet individual, Wallet group) {
        if (individual.getCustomer() == null || !individual.getCustomer().getCustomerId().equals(userId))
            throw new CustomException(ErrorCode.BAD_REQUEST);
        if (group.getGroup() == null || !group.getGroup().getGroupId().equals(groupId))
            throw new CustomException(ErrorCode.BAD_REQUEST);
        if (!groupMemberRepository.existsMember(groupId, userId))
            throw new CustomException(ErrorCode.ONLY_GROUP_MEMBER);
    }

    @Transactional(readOnly = true)
    public PersonalWalletBalanceResponseDto getPersonalWalletBalance(Long customerId, Pageable pageable) {
        // 1. 고객 및 지갑 검증
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        Wallet personalWallet = walletRepository.findByCustomerAndWalletType(customer, WalletType.INDIVIDUAL)
                .orElseThrow(() -> new CustomException(ErrorCode.WALLET_NOT_FOUND));

        // 2. 간단한 방식으로 잔액 조회
        Page<WalletStoreBalance> balances = balanceRepository
                .findPersonalWalletBalancesByCustomerIdSimple(customerId, pageable);

        // 3. Service에서 DTO 조합 (간소화)
        Page<WalletStoreBalanceDetailDto> storeBalances = balances.map(balance -> {
            return new WalletStoreBalanceDetailDto(
                    balance.getStore().getStoreId(),
                    balance.getStore().getStoreName(),
                    balance.getBalance(),
                    balance.getUpdatedAt()
            );
        });

        return new PersonalWalletBalanceResponseDto(
                customerId,
                personalWallet.getWalletId(),
                storeBalances
        );
    }

    @Transactional(readOnly = true)
    public GroupWalletBalanceResponseDto getGroupWalletBalance(Long groupId, Long customerId, Pageable pageable) {
        // 1. 고객, 모임, 멤버십 검증
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new CustomException(ErrorCode.GROUP_NOT_FOUND));

        if (!groupMemberRepository.existsMember(groupId, customerId)) {
            throw new CustomException(ErrorCode.ONLY_GROUP_MEMBER);
        }

        Wallet groupWallet = walletRepository.findByGroupId(groupId)
                .orElseThrow(() -> new CustomException(ErrorCode.WALLET_NOT_FOUND));

        // 2. 간단한 방식으로 잔액 조회
        Page<WalletStoreBalance> balances = balanceRepository
                .findGroupWalletBalancesByGroupIdSimple(groupId, pageable);

        // 3. Service에서 DTO 조합 (간소화)
        Page<WalletStoreBalanceDetailDto> storeBalances = balances.map(balance -> {
            return new WalletStoreBalanceDetailDto(
                    balance.getStore().getStoreId(),
                    balance.getStore().getStoreName(),
                    balance.getBalance(),
                    balance.getUpdatedAt()
            );
        });

        return new GroupWalletBalanceResponseDto(
                groupId,
                groupWallet.getWalletId(),
                group.getGroupName(),
                storeBalances
        );
    }

    /**
     * 개인지갑 - 특정 가게의 상세 정보 조회
     */
    @Transactional(readOnly = true)
    public WalletStoreDetailResponseDto getPersonalWalletStoreDetail(Long customerId, Long storeId, Pageable pageable) {
        // 1. 고객 및 가게 검증
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new CustomException(ErrorCode.STORE_NOT_FOUND));

        // 2. 개인지갑 조회
        Wallet personalWallet = walletRepository.findByCustomerAndWalletType(customer, WalletType.INDIVIDUAL)
                .orElseThrow(() -> new CustomException(ErrorCode.WALLET_NOT_FOUND));

        // 3. 현재 잔액 조회
        WalletStoreBalance balance = balanceRepository.findByWalletAndStore(personalWallet, store)
                .orElse(WalletStoreBalance.builder()
                        .wallet(personalWallet)
                        .store(store)
                        .balance(0L)
                        .build());

        // 4. 거래내역 조회 (페이징) - 간소화
        Page<Transaction> transactions = transactionRepository
                .findValidTransactionsByCustomerAndStore(customerId, storeId, pageable);

        // 5. Transaction을 DTO로 변환
        Page<WalletStoreTransactionDetailDto> transactionDtos = transactions
                .map(WalletStoreTransactionDetailDto::from);

        // 6. 응답 DTO 조립 (간소화)
        return new WalletStoreDetailResponseDto(
                store.getStoreId(),
                store.getStoreName(),
                balance.getBalance(),
                transactionDtos
        );
    }

    /**
     * 모임지갑 - 특정 가게의 상세 정보 조회
     */
    @Transactional(readOnly = true)
    public WalletStoreDetailResponseDto getGroupWalletStoreDetail(Long groupId, Long customerId, Long storeId, Pageable pageable) {
        // 1. 고객, 모임, 가게 검증
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new CustomException(ErrorCode.GROUP_NOT_FOUND));

        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new CustomException(ErrorCode.STORE_NOT_FOUND));

        // 2. 모임 멤버십 검증
        if (!groupMemberRepository.existsMember(groupId, customerId)) {
            throw new CustomException(ErrorCode.ONLY_GROUP_MEMBER);
        }

        // 3. 모임지갑 조회
        Wallet groupWallet = walletRepository.findByGroupId(groupId)
                .orElseThrow(() -> new CustomException(ErrorCode.WALLET_NOT_FOUND));

        // 4. 현재 잔액 조회
        WalletStoreBalance balance = balanceRepository.findByWalletAndStore(groupWallet, store)
                .orElse(WalletStoreBalance.builder()
                        .wallet(groupWallet)
                        .store(store)
                        .balance(0L)
                        .build());

        // 5. 거래내역 조회 (페이징) - 간소화
        Page<Transaction> transactions = transactionRepository
                .findValidTransactionsByGroupAndStore(groupId, storeId, pageable);

        // 6. Transaction을 DTO로 변환
        Page<WalletStoreTransactionDetailDto> transactionDtos = transactions
                .map(WalletStoreTransactionDetailDto::from);

        // 7. 응답 DTO 조립 (간소화)
        return new WalletStoreDetailResponseDto(
                store.getStoreId(),
                store.getStoreName(),
                balance.getBalance(),
                transactionDtos
        );
    }
}
