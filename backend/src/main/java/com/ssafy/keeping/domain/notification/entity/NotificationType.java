package com.ssafy.keeping.domain.notification.entity;

/**
 * 알림 타입 enum
 * 각 도메인별로 알림 타입을 정의
 */
public enum NotificationType {
    
    // 결제/정산 관련
    POINT_CHARGE("포인트 충전"),
    POINT_USE("포인트 사용"),
    PAYMENT_CANCELED("결제 취소"),
    SETTLEMENT_COMPLETED("정산 완료"),
    
    // 그룹 관련
    GROUP_INVITE("모임 초대"),
    GROUP_JOIN_REQUEST("모임 가입 요청"),
    GROUP_JOIN_ACCEPTED("모임 가입 승인"),
    GROUP_JOIN_REJECTED("모임 가입 거절"),
    GROUP_JOINED("모임 참여 완료"),
    GROUP_LEADER_CHANGED("모임 리더 변경"),
    
    // 시스템 관련
    SYSTEM_NOTICE("시스템 공지"),
    SYSTEM_MAINTENANCE("시스템 점검");

    private final String displayName;

    NotificationType(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}