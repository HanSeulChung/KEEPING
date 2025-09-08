package com.ssafy.keeping.global.exception.constants;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {
    // Store 관련
    STORE_NOT_FOUND(HttpStatus.NOT_FOUND, "해당 매장을 찾을 수 없습니다."),
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "해당 계정을 찾을 수 없습니다.");


    private final HttpStatus httpStatus;
    private final String message;
}
