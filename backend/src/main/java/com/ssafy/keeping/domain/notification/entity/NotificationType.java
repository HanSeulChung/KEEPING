package com.ssafy.keeping.domain.notification.entity;

/**
 * 알림 타입 enum
 * 각 도메인별로 알림 타입을 정의
 */
public enum NotificationType {
    
    // 결제/정산 관련
    POINT_CHARGE("포인트 충전", "포인트가 충전되었습니다."),
    POINT_USE("포인트 사용", "포인트가 사용되었습니다."),
    PAYMENT_CANCELED("결제 취소", "결제가 취소되었습니다."),
    SETTLEMENT_COMPLETED("정산 완료", "정산이 완료되어 계좌에 입금되었습니다."),
    
    // 그룹 관련
    GROUP_INVITE("그룹 초대", "그룹에 초대되었습니다."),
    GROUP_JOIN_REQUEST("가입 요청", "그룹 가입 요청이 있습니다."),
    GROUP_MEMBER_JOINED("멤버 가입", "새로운 멤버가 그룹에 가입했습니다."),
    
    // 가게 관련
    STORE_ORDER_RECEIVED("주문 접수", "새로운 주문이 접수되었습니다."),
    STORE_PROMOTION("가게 프로모션", "새로운 프로모션이 시작되었습니다."),
    
    // 시스템 관련
    SYSTEM_NOTICE("시스템 공지", "새로운 시스템 공지사항이 있습니다."),
    SYSTEM_MAINTENANCE("시스템 점검", "시스템 점검이 예정되어 있습니다.");
    
    private final String displayName;
    private final String defaultMessage;
    
    NotificationType(String displayName, String defaultMessage) {
        this.displayName = displayName;
        this.defaultMessage = defaultMessage;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public String getDefaultMessage() {
        return defaultMessage;
    }
}