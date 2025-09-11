package com.ssafy.keeping.domain.charge.repository;

import com.ssafy.keeping.domain.charge.entity.SettlementTask;
import com.ssafy.keeping.domain.charge.entity.Store;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SettlementTaskRepository extends JpaRepository<SettlementTask, Long> {

    /**
     * 처리 대기 중인 정산 작업 조회 (처리 시간이 된 것들)
     */
    @Query("SELECT st FROM SettlementTask st WHERE st.status = 'PENDING' " +
           "AND st.createdAt <= :processTime ORDER BY st.createdAt ASC")
    List<SettlementTask> findPendingTasksReadyForProcessing(@Param("processTime") LocalDateTime processTime);

    /**
     * 특정 상태의 정산 작업 조회
     */
    List<SettlementTask> findByStatusOrderByCreatedAtDesc(SettlementTask.Status status);

    /**
     * 특정 가게의 정산 작업 조회
     */
    @Query("SELECT st FROM SettlementTask st JOIN st.transaction t WHERE t.store = :store ORDER BY st.createdAt DESC")
    List<SettlementTask> findByStoreOrderByCreatedAtDesc(@Param("store") Store store);

    /**
     * 특정 가게의 PENDING 상태 정산 작업들의 총 금액 조회
     */
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM SettlementTask st JOIN st.transaction t " +
           "WHERE t.store = :store AND st.status = 'PENDING'")
    BigDecimal getTotalPendingAmountByStore(@Param("store") Store store);

    /**
     * 날짜 범위별 정산 작업 조회
     */
    @Query("SELECT st FROM SettlementTask st WHERE st.createdAt BETWEEN :startDate AND :endDate " +
           "ORDER BY st.createdAt DESC")
    List<SettlementTask> findByCreatedAtBetween(@Param("startDate") LocalDateTime startDate, 
                                               @Param("endDate") LocalDateTime endDate);

    /**
     * 특정 거래 ID의 정산 작업 조회
     */
    SettlementTask findByTransaction_TransactionId(Long transactionId);

    /**
     * 이전 주의 PENDING 상태 정산 작업 조회 (월요일 07:30 실행용)
     * 지난 주 월요일 00:00부터 일요일 23:59까지의 PENDING 상태 작업
     */
    @Query("SELECT st FROM SettlementTask st WHERE st.status = 'PENDING' " +
           "AND st.createdAt >= :weekStart AND st.createdAt < :weekEnd ORDER BY st.createdAt ASC")
    List<SettlementTask> findPendingTasksFromPreviousWeek(@Param("weekStart") LocalDateTime weekStart, 
                                                          @Param("weekEnd") LocalDateTime weekEnd);

    /**
     * LOCKED 상태의 정산 작업 조회 (화요일 01:00 실행용)
     */
    @Query("SELECT st FROM SettlementTask st WHERE st.status = 'LOCKED' ORDER BY st.createdAt ASC")
    List<SettlementTask> findLockedTasks();

    /**
     * 특정 거래의 정산 작업 상태 확인 (결제취소 검증용)
     */
    @Query("SELECT st.status FROM SettlementTask st WHERE st.transaction.transactionId = :transactionId")
    SettlementTask.Status findStatusByTransactionId(@Param("transactionId") Long transactionId);
}