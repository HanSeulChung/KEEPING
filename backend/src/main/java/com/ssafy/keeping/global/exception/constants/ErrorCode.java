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
    STORE_INVALID(HttpStatus.BAD_REQUEST, "해당 매장의 운영상태를 확인해주세요."),
    STORE_NOT_MATCH(HttpStatus.BAD_REQUEST, "두 가게가 맞지 않습니다."),

    // MenuCategory 관련
    MENU_CATEGORY_NOT_FOUND(HttpStatus.NOT_FOUND, "해당 카테고리를 찾을 수 없습니다."),
    DUPLICATE_RESOURCE(HttpStatus.BAD_REQUEST, "이미 존재하는 이름입니다."),
    MENU_CATEGORY_HAS_CHILDREN(HttpStatus.BAD_REQUEST, "해당 대분류 카테고리에 속한 카테고리들이 존재합니다."),

    // Menu 관련
    MENU_NOT_FOUND(HttpStatus.NOT_FOUND, "해당 메뉴를 찾을 수 없습니다."),

    ;
    private final HttpStatus httpStatus;
    private final String message;
}
