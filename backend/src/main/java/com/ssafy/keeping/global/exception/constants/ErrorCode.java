package com.ssafy.keeping.global.exception.constants;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {
    // Store 관련
    ITEM_NOT_FOUND(HttpStatus.NOT_FOUND, "해당 상품을 찾을 수 없습니다."),

    // Store 관련
    STORE_NOT_FOUND(HttpStatus.NOT_FOUND, "해당 매장을 찾을 수 없습니다."),
    STORE_ALREADY_EXISTS(HttpStatus.CONFLICT, "이미 등록한 주소의 가게입니다. 다시 확인해주세요."),
    STORE_INVALID(HttpStatus.BAD_REQUEST, "해당 매장의 운영상태를 확인해주세요."),
    STORE_NOT_MATCH(HttpStatus.BAD_REQUEST, "두 가게가 맞지 않습니다."),

    // MenuCategory 관련
    MENU_CATEGORY_NOT_FOUND(HttpStatus.NOT_FOUND, "해당 카테고리를 찾을 수 없습니다."),
    DUPLICATE_RESOURCE(HttpStatus.BAD_REQUEST, "이미 존재하는 이름입니다."),
    MENU_CATEGORY_HAS_CHILDREN(HttpStatus.BAD_REQUEST, "해당 대분류 카테고리에 속한 카테고리들이 존재합니다."),

    // 선결제/정산 관련
    CUSTOMER_NOT_FOUND(HttpStatus.NOT_FOUND, "고객을 찾을 수 없습니다."),
    OWNER_NOT_FOUND(HttpStatus.NOT_FOUND, "점주를 찾을 수 없습니다."),
    USER_KEY_NOT_FOUND(HttpStatus.BAD_REQUEST, "SSAFY 은행에 등록되지 않은 사용자입니다."),
    WALLET_NOT_FOUND(HttpStatus.NOT_FOUND, "지갑을 찾을 수 없습니다."),
    CARD_PAYMENT_FAILED(HttpStatus.BAD_REQUEST, "카드 결제에 실패했습니다."),
    ACCOUNT_DEPOSIT_FAILED(HttpStatus.BAD_REQUEST, "계좌 입금에 실패했습니다."),
    EXTERNAL_API_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "외부 API 통신 중 오류가 발생했습니다."),
    
    // 취소 관련
    TRANSACTION_NOT_FOUND(HttpStatus.NOT_FOUND, "해당 거래를 찾을 수 없습니다."),
    SETTLEMENT_TASK_NOT_FOUND(HttpStatus.NOT_FOUND, "해당 정산 작업을 찾을 수 없습니다."),
    CANCEL_NOT_AVAILABLE(HttpStatus.BAD_REQUEST, "취소할 수 없는 거래입니다."),
    UNAUTHORIZED_ACCESS(HttpStatus.FORBIDDEN, "본인의 거래만 취소할 수 있습니다."),

    // Menu 관련
    MENU_NOT_FOUND(HttpStatus.NOT_FOUND, "해당 메뉴를 찾을 수 없습니다."),
    MENU_CROSS_STORE_CONFLICT(HttpStatus.CONFLICT, "다른 매장의 메뉴가 포함되어 있습니다."),
    MENU_UNAVAILABLE(HttpStatus.CONFLICT, "품절/비활성 메뉴가 포함되어 있습니다."),

    // Group 관련
    INVALID_ROLE(HttpStatus.BAD_REQUEST, "고객 사용자만 모임을 생성할 수 있습니다."),
    GROUP_NOT_FOUND(HttpStatus.NOT_FOUND, "해당 모임을 찾을 수 없습니다."),
    ONLY_GROUP_MEMBER(HttpStatus.FORBIDDEN, "해당 모임원만 접근 가능합니다."),
    ALREADY_GROUP_MEMBER(HttpStatus.BAD_REQUEST, "이미 해당 모임의 모임원입니다."),
    ALREADY_GROUP_REQUEST(HttpStatus.BAD_REQUEST, "이미 해당 모임에 추가 신청되어있습니다."),
    ONLY_GROUP_LEADER(HttpStatus.FORBIDDEN, "해당 모임장만 접근 가능합니다."),
    ALREADY_PROCESS_REQUEST(HttpStatus.BAD_REQUEST, "이미 처리된 요청입니다."),
    ADD_REQUEST_NOT_FOUND(HttpStatus.NOT_FOUND, "해당 추가 요청을 찾을 수 없습니다."),
    CODE_NOT_MATCH(HttpStatus.BAD_REQUEST, "코드가 일치하지 않습니다."),
    GROUP_MEMBER_NOT_FOUND(HttpStatus.NOT_FOUND, "해당 모임원을 찾을 수 없습니다."),

    // wallet - group 관련
    BEFORE_INDIVIDUAL_CHARGE(HttpStatus.BAD_REQUEST, "개인 지갑에 충전이 먼저 되어야합니다."),
    OVER_INDIVIDUAL_POINT(HttpStatus.BAD_REQUEST, "개인 지갑 포인트 이하로 공유 가능합니다."),
    INCONSISTENT_STATE(HttpStatus.CONFLICT, "처리 중 상태가 일치하지 않습니다."),

    // user 관련
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "해당 사용자를 찾을 수 없습니다."),

    // 결제 요청(Payment Intent) / 검증
    PAYMENT_INIT_ORDER_EMPTY(HttpStatus.BAD_REQUEST, "주문 항목이 비어 있습니다."),
    PAYMENT_INIT_STORE_ID_REQUIRED(HttpStatus.BAD_REQUEST, "storeId는 필수입니다."),
    PAYMENT_INIT_QUANTITY_INVALID(HttpStatus.BAD_REQUEST, "수량은 1 이상이어야 합니다."),
    PAYMENT_INTENT_NOT_FOUND(HttpStatus.NOT_FOUND, "결제 요청 찾을 수 없습니다."),

    // 멱등성(Idempotency)
    IDEMPOTENCY_KEY_REQUIRED(HttpStatus.BAD_REQUEST, "Idempotency-Key 헤더가 필요합니다."),
    IDEMPOTENCY_BEGIN_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "멱등성 처리 시작에 실패했습니다."),
    IDEMPOTENCY_BODY_CONFLICT(HttpStatus.CONFLICT, "Idempotency-Key 충돌: 요청 내용이 처음과 다릅니다."),
    IDEMPOTENCY_REPLAY_UNAVAILABLE(HttpStatus.CONFLICT, "이미 처리된 요청이나 응답을 복원할 수 없습니다."),
    IDEMPOTENCY_KEY_INVALID(HttpStatus.BAD_REQUEST, "Idempotency-Key 형식이 잘못되었습니다."),

    // QR
    QR_NOT_FOUND(HttpStatus.NOT_FOUND, "QR 토큰을 찾을 수 없거나 사용 불가 상태입니다."),
    QR_EXPIRED(HttpStatus.GONE, "QR 토큰이 만료되었습니다."),
    QR_MODE_UNSUPPORTED(HttpStatus.BAD_REQUEST, "지원하지 않는 QR 모드입니다."),
    QR_STORE_MISMATCH(HttpStatus.FORBIDDEN, "바인딩된 매장과 일치하지 않는 요청입니다."),

    // 스냅샷/직렬화
    REQUEST_CANONICALIZE_FAILED(HttpStatus.BAD_REQUEST, "요청 본문 직렬화에 실패했습니다."),
    RESPONSE_SNAPSHOT_PARSE_FAILED(HttpStatus.CONFLICT, "이전에 처리된 응답을 복원할 수 없습니다."),

    // 인증 관련
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "인증이 필요합니다."),
    INVALID_TOKEN(HttpStatus.UNAUTHORIZED, "유효하지 않은 토큰입니다."),
    EXPIRED_TOKEN(HttpStatus.UNAUTHORIZED, "만료된 토큰입니다."),
    TOKEN_NOT_FOUND(HttpStatus.UNAUTHORIZED, "토큰을 찾을 수 없습니다."),

    // 권한 관련
    FORBIDDEN(HttpStatus.FORBIDDEN, "접근 권한이 없습니다."),
    ROLE_NOT_FOUND(HttpStatus.FORBIDDEN, "권한 정보를 찾을 수 없습니다."),

    // OAuth 관련
    OAUTH_PROVIDER_NOT_FOUND(HttpStatus.BAD_REQUEST, "지원하지 않는 로그인 방식입니다."),
    OAUTH_AUTHENTICATION_FAILED(HttpStatus.UNAUTHORIZED, "OAuth 인증에 실패하였습니다."),
    OAUTH_USER_INFO_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "사용자 정보를 가져올 수 없습니다."),

    // global
    BAD_REQUEST(HttpStatus.BAD_REQUEST, "올바르지 않은 요청값입니다."),

    // 결제 요청(Payment Intent) / 승인 검증 추가
    PAYMENT_INTENT_STATUS_CONFLICT(HttpStatus.CONFLICT, "결제 요청 상태가 승인 가능 상태가 아닙니다."),
    PAYMENT_INTENT_EXPIRED(HttpStatus.GONE, "결제 요청의 승인 가능 시간이 만료되었습니다."),
    PAYMENT_INTENT_OWNER_MISMATCH(HttpStatus.FORBIDDEN, "결제 요청 소유자와 승인 주체가 일치하지 않습니다."),

    // PIN 인증 관련
    PIN_REQUIRED(HttpStatus.BAD_REQUEST, "결제 비밀번호(PIN)는 필수입니다."),
    PIN_INVALID(HttpStatus.UNAUTHORIZED, "결제 비밀번호(PIN)가 올바르지 않습니다."),
    PIN_NOT_SET(HttpStatus.BAD_REQUEST, "설정된 결제 비밀번호(PIN)가 없습니다."),
    PIN_LOCKED(HttpStatus.LOCKED, "PIN 입력이 일정 시간 잠겨 있습니다. 잠시 후 다시 시도하세요."), // 423 Locked
    PIN_LENGTH_INVALID(HttpStatus.BAD_REQUEST, "결제 비밀번호(PIN)의 길이는 6자리 이여야 합니다."),
    // 자금/한도 관련
    FUNDS_INSUFFICIENT(HttpStatus.PAYMENT_REQUIRED, "잔액이 부족합니다."),
    PAYMENT_POLICY_VIOLATION(HttpStatus.UNPROCESSABLE_ENTITY, "결제 정책에 따라 승인할 수 없습니다.");

    private final HttpStatus httpStatus;
    private final String message;
}
