package com.ssafy.keeping.global.exception.constants;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {
    // Store 관련
    STORE_NOT_FOUND(HttpStatus.NOT_FOUND, "해당 매장을 찾을 수 없습니다."),
    STORE_ALREADY_EXISTS(HttpStatus.CONFLICT, "이미 등록한 주소의 가게입니다. 다시 확인해주세요."),
    STORE_INVALID(HttpStatus.BAD_REQUEST, "해당 매장을 찾을 수 없습니다.")
    ;
    private final HttpStatus httpStatus;
    private final String message;
}
