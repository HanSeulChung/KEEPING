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

    // Group 관련
    INVALID_ROLE(HttpStatus.BAD_REQUEST, "고객 사용자만 모임을 생성할 수 있습니다."),
    GROUP_NOT_FOUND(HttpStatus.NOT_FOUND, "해당 모임을 찾을 수 없습니다."),
    ONLY_GROUP_MEMBER(HttpStatus.FORBIDDEN, "해당 모임원만 접근 가능합니다."),
    ALREADY_GROUP_MEMBER(HttpStatus.BAD_REQUEST, "이미 해당 모임의 모임원입니다."),
    ALREADY_GROUP_REQUEST(HttpStatus.BAD_REQUEST, "이미 해당 모임에 추가 신청되어있습니다."),
    ONLY_GROUP_LEADER(HttpStatus.FORBIDDEN, "해당 모임장만 접근 가능합니다."),
    ALREADY_PROCESS_REQUEST(HttpStatus.BAD_REQUEST, "이미 처리된 요청입니다."),
    ADD_REQUEST_NOT_FOUND(HttpStatus.NOT_FOUND, "해당 추가 요청을 찾을 수 없습니다."),
    // user 관련
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "해당 사용자를 찾을 수 없습니다.")
    ;
    private final HttpStatus httpStatus;
    private final String message;
}
