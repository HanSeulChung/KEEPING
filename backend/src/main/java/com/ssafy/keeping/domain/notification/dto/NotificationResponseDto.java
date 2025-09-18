package com.ssafy.keeping.domain.notification.dto;

import com.ssafy.keeping.domain.notification.entity.Notification;
import com.ssafy.keeping.domain.notification.entity.NotificationType;
import lombok.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class NotificationResponseDto {

    private Long notificationId;
    private String content;
    private String url;
    private Boolean isRead;
    private NotificationType notificationType;
    private String receiverType; // "CUSTOMER" 또는 "OWNER"
    private Long receiverId;
    private String receiverName;
    private String createdAt;

    // Notification 엔티티로부터 DTO 생성
    public static NotificationResponseDto from(Notification notification) {
        return NotificationResponseDto.builder()
                .notificationId(notification.getNotificationId())
                .content(notification.getContent())
                .url(notification.getUrl())
                .isRead(notification.getIsRead())
                .notificationType(notification.getNotificationType())
                .receiverType(notification.getReceiverType())
                .receiverId(notification.getReceiverId())
                .receiverName(notification.getReceiverName())
                .createdAt(notification.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")))
                .build();
    }
}