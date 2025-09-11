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
}