package com.ssafy.keeping.global.exception.constants;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {
    // Store 관련
    ITEM_NOT_FOUND(HttpStatus.NOT_FOUND, "해당 상품을 찾을 수 없습니다."),
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "해당 계정을 찾을 수 없습니다."),

    // 선결제/정산 관련
    CUSTOMER_NOT_FOUND(HttpStatus.NOT_FOUND, "고객을 찾을 수 없습니다."),
    STORE_NOT_FOUND(HttpStatus.NOT_FOUND, "가게를 찾을 수 없습니다."),
    OWNER_NOT_FOUND(HttpStatus.NOT_FOUND, "점주를 찾을 수 없습니다."),
    USER_KEY_NOT_FOUND(HttpStatus.BAD_REQUEST, "SSAFY 은행에 등록되지 않은 사용자입니다."),
    WALLET_NOT_FOUND(HttpStatus.NOT_FOUND, "지갑을 찾을 수 없습니다."),
    CARD_PAYMENT_FAILED(HttpStatus.BAD_REQUEST, "카드 결제에 실패했습니다."),
    ACCOUNT_DEPOSIT_FAILED(HttpStatus.BAD_REQUEST, "계좌 입금에 실패했습니다."),
    EXTERNAL_API_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "외부 API 통신 중 오류가 발생했습니다.");


    private final HttpStatus httpStatus;
    private final String message;
}
