package com.ssafy.keeping.domain.notification.controller;

import com.ssafy.keeping.domain.notification.service.NotificationService;
import com.ssafy.keeping.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import jakarta.validation.constraints.Positive;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Slf4j
@Validated
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * 고객용 SSE 구독
     * 
     * @param customerId 고객 ID
     * @param lastEventId 마지막으로 받은 이벤트 ID (재연결용)
     * @return SseEmitter
     */
    @GetMapping(value = "/subscribe/customer/{customerId}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribeCustomer(@PathVariable Long customerId,
                                       @RequestHeader(value = "Last-Event-ID", required = false, defaultValue = "") String lastEventId) {
        
        log.info("고객 SSE 구독 요청 - 고객ID: {}, Last-Event-ID: {}", customerId, lastEventId);
        
        return notificationService.subscribe("customer", customerId, lastEventId);
    }

    /**
     * 점주용 SSE 구독
     * 
     * @param ownerId 점주 ID
     * @param lastEventId 마지막으로 받은 이벤트 ID (재연결용)
     * @return SseEmitter
     */
    @GetMapping(value = "/subscribe/owner/{ownerId}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribeOwner(@PathVariable Long ownerId,
                                    @RequestHeader(value = "Last-Event-ID", required = false, defaultValue = "") String lastEventId) {
        
        log.info("점주 SSE 구독 요청 - 점주ID: {}, Last-Event-ID: {}", ownerId, lastEventId);
        
        return notificationService.subscribe("owner", ownerId, lastEventId);
    }

    /**
     * 테스트용 알림 전송 API (개발/테스트 환경용)
     * 
     * @param receiverType "customer" 또는 "owner"
     * @param receiverId 수신자 ID
     * @param message 알림 메시지
     */
    @PostMapping("/test/{receiverType}/{receiverId}")
    public ResponseEntity<ApiResponse<String>> sendTestNotification(@PathVariable String receiverType,
                                                                   @PathVariable Long receiverId,
                                                                   @RequestParam String message) {
        
        log.info("테스트 알림 전송 - {}:{}, 메시지: {}", receiverType, receiverId, message);
        
        try {
            if ("customer".equals(receiverType)) {
                notificationService.sendToCustomer(receiverId, 
                    com.ssafy.keeping.domain.notification.entity.NotificationType.SYSTEM_NOTICE, 
                    "[테스트] " + message, 
                    "/test");
            } else if ("owner".equals(receiverType)) {
                notificationService.sendToOwner(receiverId, 
                    com.ssafy.keeping.domain.notification.entity.NotificationType.SYSTEM_NOTICE, 
                    "[테스트] " + message, 
                    "/test");
            } else {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("잘못된 수신자 타입입니다. (customer 또는 owner)", HttpStatus.BAD_REQUEST.value()));
            }
            
            return ResponseEntity.ok(
                ApiResponse.success(
                    "테스트 알림 전송 완료", 
                    HttpStatus.OK.value(), 
                    "알림이 성공적으로 전송되었습니다."
                )
            );
            
        } catch (Exception e) {
            log.error("테스트 알림 전송 실패", e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("알림 전송 중 오류가 발생했습니다.", HttpStatus.INTERNAL_SERVER_ERROR.value()));
        }
    }

    /**
     * 고객 알림 읽음 처리
     * 
     * @param customerId 고객 ID
     * @param notificationId 알림 ID
     * @return 읽음 처리 결과
     */
    @PutMapping("/customer/{customerId}/{notificationId}/read")
    public ResponseEntity<ApiResponse<String>> markAsReadForCustomer(
            @PathVariable @Positive(message = "고객 ID는 양수여야 합니다.") Long customerId,
            @PathVariable @Positive(message = "알림 ID는 양수여야 합니다.") Long notificationId) {
        
        log.info("고객 알림 읽음 처리 요청 - 고객ID: {}, 알림ID: {}", customerId, notificationId);
        
        notificationService.markAsReadForCustomer(customerId, notificationId);
        
        log.info("고객 알림 읽음 처리 성공 - 고객ID: {}, 알림ID: {}", customerId, notificationId);
        return ResponseEntity.ok(
            ApiResponse.success("알림이 읽음 처리되었습니다.", HttpStatus.OK.value(), "success")
        );
    }

    /**
     * 점주 알림 읽음 처리
     * 
     * @param ownerId 점주 ID
     * @param notificationId 알림 ID
     * @return 읽음 처리 결과
     */
    @PutMapping("/owner/{ownerId}/{notificationId}/read")
    public ResponseEntity<ApiResponse<String>> markAsReadForOwner(
            @PathVariable @Positive(message = "점주 ID는 양수여야 합니다.") Long ownerId,
            @PathVariable @Positive(message = "알림 ID는 양수여야 합니다.") Long notificationId) {
        
        log.info("점주 알림 읽음 처리 요청 - 점주ID: {}, 알림ID: {}", ownerId, notificationId);
        
        notificationService.markAsReadForOwner(ownerId, notificationId);
        
        log.info("점주 알림 읽음 처리 성공 - 점주ID: {}, 알림ID: {}", ownerId, notificationId);
        return ResponseEntity.ok(
            ApiResponse.success("알림이 읽음 처리되었습니다.", HttpStatus.OK.value(), "success")
        );
    }
}