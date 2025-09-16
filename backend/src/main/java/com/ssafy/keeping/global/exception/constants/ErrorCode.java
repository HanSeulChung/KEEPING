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

    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "해당 사용자를 찾을 수 없습니다.");

    private final HttpStatus httpStatus;
    private final String message;
}
