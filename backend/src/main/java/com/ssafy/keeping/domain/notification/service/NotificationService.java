package com.ssafy.keeping.domain.notification.service;

import com.ssafy.keeping.domain.core.customer.model.Customer;
import com.ssafy.keeping.domain.core.customer.repository.CustomerRepository;
import com.ssafy.keeping.domain.core.owner.model.Owner;
import com.ssafy.keeping.domain.core.owner.repository.OwnerRepository;
import com.ssafy.keeping.domain.notification.dto.NotificationResponseDto;
import com.ssafy.keeping.domain.notification.entity.Notification;
import com.ssafy.keeping.domain.notification.entity.NotificationType;
import com.ssafy.keeping.domain.notification.repository.EmitterRepository;
import com.ssafy.keeping.domain.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final EmitterRepository emitterRepository;
    private final NotificationRepository notificationRepository;
    private final CustomerRepository customerRepository;
    private final OwnerRepository ownerRepository;
    private final FcmService fcmService;

    private static final Long DEFAULT_TIMEOUT = 60L * 1000 * 60; // 60분

    //   - 알림 전송 실패가 핵심 비즈니스를 방해하면 안됨
    //  - 결제 취소는 성공했는데 알림 때문에 전체가 실패하면 더 큰 문제
    //  - 사용자 경험상 알림 없어도 기능은 동작해야 함

    /**
     * 클라이언트가 구독을 위해 호출하는 메서드
     * @param receiverType "customer" 또는 "owner"
     * @param receiverId 사용자 ID
     * @param lastEventId 마지막으로 받은 이벤트 ID (재연결용)
     * @return SseEmitter
     */
    // "구독"은 실시간 알림을 받기 위해 맨 처음 단 한 번, 서버와 클라이언트(브라우저) 사이에 '알림 전용 통신선'을 개통하는 행위입니다.
    public SseEmitter subscribe(String receiverType, Long receiverId, String lastEventId) {
        String emitterId = makeTimeIncludeId(receiverType, receiverId);

        SseEmitter sseEmitter = emitterRepository.save(emitterId, new SseEmitter(DEFAULT_TIMEOUT));
        
        log.info("SSE 구독 시작 - {}:{}, EmitterID: {}", receiverType, receiverId, emitterId);
        // Emitter 완료/타임아웃/에러 시 정리 작업
        sseEmitter.onCompletion(() -> {
            log.info("SSE 연결 완료 - EmitterID: {}", emitterId);
            emitterRepository.deleteById(emitterId);
        });
        
        sseEmitter.onTimeout(() -> {
            log.info("SSE 연결 타임아웃 - EmitterID: {}", emitterId);
            emitterRepository.deleteById(emitterId);
        });
        
        sseEmitter.onError((e) -> {
            log.error("SSE 연결 에러 - EmitterID: {}, Error: {}", emitterId, e.getMessage());
            emitterRepository.deleteById(emitterId);
        });

        // 503 에러 방지를 위한 더미 이벤트 전송
        try {
            String eventId = makeTimeIncludeId(receiverType, receiverId);
            boolean connectionSuccess = sendNotification(sseEmitter, eventId, emitterId, 
                "SSE 연결 성공 [" + receiverType + ":" + receiverId + "]");
            
            if (!connectionSuccess) {
                log.warn("초기 연결 이벤트 전송 실패 - EmitterID: {}", emitterId);
            }
            
            // 클라이언트가 재연결한 경우, 유실된 이벤트 전송
            // lastEventId는 서버가 만드는 것이 아니라, 클라이언트(브라우저)가 보내주는 값
            // lastEventId는 있을 수도, 없을 수도 있음. 만약 있을 경우 서버 연결이 실패한 것
            // 없을 때는 사용자가 처음 로그인해서 맺는 최초의 연결임
            if (hasLostData(lastEventId)) {
                sendLostData(lastEventId, receiverType, receiverId, emitterId, sseEmitter);
            } else {
                sendMissedNotifications(receiverType, receiverId, emitterId, sseEmitter);
                // 로그인 시 읽지 않은 알림 전송 (lastEventId 유무와 관계없이 항상 실행) - 최초 로그인
            }
            //   작동 방식:
            //  1. 최초 연결: lastEventId가 없음 → 밀린 알림만 전송
            //  2. 재연결: lastEventId가 있음 → 유실된 이벤트 + 밀린 알림 모두 전송
            // 프론트가


        } catch (Exception e) {
            log.error("SSE 구독 초기화 중 오류 - EmitterID: {}", emitterId, e);
            cleanupEmitter(emitterId);
        }

        return sseEmitter;
    }

    /**
     * 고객에게 알림 전송
     * @param customerId 고객 ID
     * @param notificationType 알림 타입
     * @param content 알림 내용
     * @param url 클릭 시 이동할 URL
     */
    public void sendToCustomer(Long customerId, NotificationType notificationType, String content, String url) {
        try {
            // 입력 값 검증
            if (customerId == null || notificationType == null || content == null || content.trim().isEmpty()) {
                log.warn("고객 알림 전송 실패 - 필수 파라미터 누락: customerId={}, type={}, content={}", 
                        customerId, notificationType, content);
                return;
            }

            // user 검증
            Customer customer = customerRepository.findById(customerId).orElse(null);
            if (customer == null) {
                log.warn("고객 알림 전송 실패 - 존재하지 않는 고객 ID: {}", customerId);
                return;
            }

            // DB에 알림 저장
            Notification notification = Notification.builder()
                    .customer(customer)
                    .content(content)
                    .url(url != null ? url : "")
                    .notificationType(notificationType)
                    .build();
            
            notification = notificationRepository.save(notification);
            log.info("고객 알림 DB 저장 완료 - 고객ID: {}, 알림ID: {}, 타입: {}", 
                    customerId, notification.getNotificationId(), notificationType);

            // 포그라운드/백그라운드 분기하여 알림 전송
            sendNotificationWithStrategy(NotificationResponseDto.from(notification));
            
        } catch (Exception e) {
            log.error("고객 알림 전송 중 예상치 못한 오류 - 고객ID: {}, 타입: {}", customerId, notificationType, e);
        }
    }

    /**
     * 점주에게 알림 전송
     * @param ownerId 점주 ID
     * @param notificationType 알림 타입
     * @param content 알림 내용
     * @param url 클릭 시 이동할 URL
     */
    public void sendToOwner(Long ownerId, NotificationType notificationType, String content, String url) {
        try {
            // 입력 값 검증
            if (ownerId == null || notificationType == null || content == null || content.trim().isEmpty()) {
                log.warn("점주 알림 전송 실패 - 필수 파라미터 누락: ownerId={}, type={}, content={}", 
                        ownerId, notificationType, content);
                return;
            }
            
            Owner owner = ownerRepository.findById(ownerId).orElse(null);
            if (owner == null) {
                log.warn("점주 알림 전송 실패 - 존재하지 않는 점주 ID: {}", ownerId);
                return;
            }

            // DB에 알림 저장
            Notification notification = Notification.builder()
                    .owner(owner)
                    .content(content)
                    .url(url != null ? url : "")
                    .notificationType(notificationType)
                    .build();
            
            notification = notificationRepository.save(notification);
            log.info("점주 알림 DB 저장 완료 - 점주ID: {}, 알림ID: {}, 타입: {}", 
                    ownerId, notification.getNotificationId(), notificationType);

            // 포그라운드/백그라운드 분기하여 알림 전송
            sendNotificationWithStrategy(NotificationResponseDto.from(notification));
            
        } catch (Exception e) {
            log.error("점주 알림 전송 중 예상치 못한 오류 - 점주ID: {}, 타입: {}", ownerId, notificationType, e);
        }
    }

    /**
     * 포그라운드/백그라운드 분기하여 알림 전송
     */
    private void sendNotificationWithStrategy(NotificationResponseDto data) {
        String receiverType = data.getReceiverType().toLowerCase();
        Long receiverId = data.getReceiverId();
        
        try {
            // 활성 SSE 연결이 있는지 확인
            boolean hasActiveConnection = emitterRepository.hasActiveConnection(receiverType, receiverId);
            
            if (hasActiveConnection) {
                // 포그라운드: SSE로 실시간 전송
                log.info("포그라운드 상태 감지 - SSE로 알림 전송: {}:{}", receiverType, receiverId);
                sendRealTimeNotification(data);
            } else {
                // 백그라운드: FCM으로 푸시 알림 전송
                log.info("백그라운드 상태 감지 - FCM으로 푸시 알림 전송: {}:{}", receiverType, receiverId);
                sendFcmNotification(data);
            }
            
        } catch (Exception e) {
            log.error("알림 전송 전략 선택 중 오류 - {}:{}", receiverType, receiverId, e);
        }
    }
    
    /**
     * FCM 푸시 알림 전송
     */
    private void sendFcmNotification(NotificationResponseDto data) {
        String receiverType = data.getReceiverType().toLowerCase();
        Long receiverId = data.getReceiverId();
        String title = "새 알림";
        String body = data.getContent();
        
        try {
            // 알림 타입별 제목 설정
            if (data.getNotificationType() != null) {
                title = data.getNotificationType().getDisplayName();
            }
            
            // 추가 데이터 설정
            Map<String, String> fcmData = Map.of(
                "notificationId", data.getNotificationId().toString(),
                "type", data.getNotificationType() != null ? data.getNotificationType().toString() : "UNKNOWN",
                "url", data.getUrl() != null ? data.getUrl() : "",
                "createdAt", data.getCreatedAt().toString()
            );
            
            if ("customer".equals(receiverType)) {
                fcmService.sendToCustomer(receiverId, data.getNotificationType(), title, body, fcmData);
            } else if ("owner".equals(receiverType)) {
                fcmService.sendToOwner(receiverId, data.getNotificationType(), title, body, fcmData);
            }
            
            log.info("FCM 푸시 알림 전송 완료 - {}:{}, 제목: {}", receiverType, receiverId, title);
            
        } catch (Exception e) {
            log.error("FCM 푸시 알림 전송 실패 - {}:{}", receiverType, receiverId, e);
        }
    }

    /**
     * 실시간 알림 전송 (SSE) - 총괄 메니저 역할
     */
    // receiverType : customer, owner
    private void sendRealTimeNotification(NotificationResponseDto data) {
        String receiverType = data.getReceiverType().toLowerCase();
        Long receiverId = data.getReceiverId();

        try {
            Map<String, SseEmitter> emitters = emitterRepository.findAllEmitterStartWithByReceiver(receiverType, receiverId);
            
            if (emitters.isEmpty()) {
                log.info("연결된 사용자 없음 - {}:{}, 알림을 캐시에만 저장", receiverType, receiverId);
                return;
            }
            
            // 하나의 알림에 대해 단일 eventId 생성 (모든 연결에서 동일하게 사용)
            String eventId = makeTimeIncludeId(receiverType, receiverId);
            
            // 이벤트 캐시에 한 번만 저장 (중복 저장 방지)
            emitterRepository.saveEventCache(eventId, data);
            
            // 단순 카운터
            int successCount = 0;
            int failCount = 0;
            
            // 모든 emitter에 순차 전송
            for (Map.Entry<String, SseEmitter> entry : emitters.entrySet()) {
                String emitterId = entry.getKey();
                SseEmitter emitter = entry.getValue();
                
                try {
                    boolean success = sendNotification(emitter, eventId, emitterId, data);
                    if (success) {
                        successCount++;
                    } else {
                        failCount++;
                    }
                } catch (Exception e) {
                    failCount++;
                    log.warn("개별 SSE 전송 실패 - EmitterID: {}, 사유: {}", emitterId, e.getMessage());
                }
            }
            
            log.info("실시간 알림 전송 완료 - {}:{}, EventID: {}, 총 연결: {}, 성공: {}, 실패: {}", 
                    receiverType, receiverId, eventId, emitters.size(), successCount, failCount);
                    
        } catch (Exception e) {
            log.error("실시간 알림 전송 중 예상치 못한 오류 - {}:{}", receiverType, receiverId, e);
        }
    }

    /**
     * SSE로 알림 전송 ( 실제로 알림 전송 - 네트워크 관여 )
     * @return 전송 성공 여부
     */
    private boolean sendNotification(SseEmitter emitter, String eventId, String emitterId, Object data) {
        try {
            emitter.send(SseEmitter.event()
                    .id(eventId)
                    .name("notification")
                    .data(data));
            return true;
            
        } catch (IOException e) {
            log.warn("SSE 전송 실패 - EmitterID: {}, EventID: {}, 오류: {}", 
                    emitterId, eventId, e.getMessage());
            
            // 연결이 끊어진 Emitter 정리
            cleanupEmitter(emitterId);
            return false;
            
        } catch (Exception e) {
            log.error("SSE 전송 중 예상치 못한 오류 - EmitterID: {}, EventID: {}", 
                    emitterId, eventId, e);
            
            // 예상치 못한 오류 시에도 Emitter 정리
            cleanupEmitter(emitterId);
            return false;
        }
    }

    /**
     * Emitter 안전 정리 - 제대로 응답 안하는 id 하나만 삭제함
     */
    private void cleanupEmitter(String emitterId) {
        try {
            emitterRepository.deleteById(emitterId);
        } catch (Exception e) {
            log.warn("Emitter 정리 중 오류 - EmitterID: {}, 오류: {}", emitterId, e.getMessage());
        }
    }

    /**
     * 유니크한 ID 생성
     */
    private String makeTimeIncludeId(String receiverType, Long receiverId) {
        return receiverType + "-" + receiverId + "_" + System.currentTimeMillis();
    }

    /**
     * 유실된 데이터가 있는지 확인
     */
    private boolean hasLostData(String lastEventId) {
        return lastEventId != null && !lastEventId.isEmpty();
    }

    /**
     * 유실된 데이터 전송
     */
    private void sendLostData(String lastEventId, String receiverType, Long receiverId, 
                             String emitterId, SseEmitter emitter) {
        Map<String, Object> eventCaches = emitterRepository.findAllEventCacheStartWithByReceiver(receiverType, receiverId);
        
        eventCaches.entrySet().stream()
                .filter(entry -> lastEventId.compareTo(entry.getKey()) < 0)
                .forEach(entry -> sendNotification(emitter, entry.getKey(), emitterId, entry.getValue()));
                
        log.info("유실된 데이터 재전송 완료 - {}:{}, 재전송 수: {}", receiverType, receiverId, eventCaches.size());
    }

    /**
     * 로그인 시 읽지 않은 알림들을 실시간으로 전송
     * @param receiverType "customer" 또는 "owner"
     * @param receiverId 사용자 ID
     * @param emitterId Emitter ID
     * @param emitter SSE Emitter
     */
    private void sendMissedNotifications(String receiverType, Long receiverId, String emitterId, SseEmitter emitter) {
        try {
            log.info("밀린 알림 전송 시작 - {}:{}", receiverType, receiverId);
            
            List<Notification> missedNotifications;
            
            // 사용자 타입에 따라 읽지 않은 알림 조회
            if ("customer".equalsIgnoreCase(receiverType)) {
                missedNotifications = notificationRepository.findUnreadNotificationsByCustomerId(receiverId);
            } else if ("owner".equalsIgnoreCase(receiverType)) {
                missedNotifications = notificationRepository.findUnreadNotificationsByOwnerId(receiverId);
            } else {
                log.warn("알 수 없는 사용자 타입 - receiverType: {}", receiverType);
                return;
            }
            
            if (missedNotifications.isEmpty()) {
                log.info("밀린 알림 없음 - {}:{}", receiverType, receiverId);
                return;
            }
            
            log.info("밀린 알림 발견 - {}:{}, 개수: {}", receiverType, receiverId, missedNotifications.size());
            
            int successCount = 0;
            int failCount = 0;
            
            // 각 알림을 순차적으로 전송 (오래된 것부터)
            for (Notification notification : missedNotifications) {
                try {
                    NotificationResponseDto responseDto = NotificationResponseDto.from(notification);
                    String eventId = makeTimeIncludeId(receiverType, receiverId);
                    
                    boolean success = sendNotification(emitter, eventId, emitterId, responseDto);
                    if (success) {
                        successCount++;
                        log.debug("밀린 알림 전송 성공 - 알림ID: {}", notification.getNotificationId());
                    } else {
                        failCount++;
                        log.warn("밀린 알림 전송 실패 - 알림ID: {}", notification.getNotificationId());
                        // 전송 실패 시 루프 중단 (연결이 끊어진 상태)
                        break;
                    }
                    
                    // 너무 빠른 전송 방지를 위한 소량 지연 (선택사항)
                    Thread.sleep(10);
                    
                } catch (Exception e) {
                    failCount++;
                    log.warn("밀린 알림 전송 중 오류 - 알림ID: {}, 오류: {}", 
                            notification.getNotificationId(), e.getMessage());
                }
            }
            
            log.info("밀린 알림 전송 완료 - {}:{}, 총 개수: {}, 성공: {}, 실패: {}", 
                    receiverType, receiverId, missedNotifications.size(), successCount, failCount);
                    
        } catch (Exception e) {
            log.error("밀린 알림 전송 중 예상치 못한 오류 - {}:{}", receiverType, receiverId, e);
        }
    }






}