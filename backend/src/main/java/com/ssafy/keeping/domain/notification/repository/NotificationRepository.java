package com.ssafy.keeping.domain.notification.repository;

import com.ssafy.keeping.domain.notification.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    /**
     * 특정 고객의 알림인지 확인 (권한 검증용)
     */
    @Query("SELECT n FROM Notification n WHERE n.notificationId = :notificationId AND n.customer.customerId = :customerId")
    Optional<Notification> findByNotificationIdAndCustomerId(@Param("notificationId") Long notificationId, 
                                                           @Param("customerId") Long customerId);

    /**
     * 특정 점주의 알림인지 확인 (권한 검증용)
     */
    @Query("SELECT n FROM Notification n WHERE n.notificationId = :notificationId AND n.owner.ownerId = :ownerId")
    Optional<Notification> findByNotificationIdAndOwnerId(@Param("notificationId") Long notificationId, 
                                                        @Param("ownerId") Long ownerId);
}