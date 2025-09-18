package com.ssafy.keeping.domain.payment.transactions.repository;

import com.ssafy.keeping.domain.payment.transactions.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    /**
     * transactionUniqueNo로 거래 조회
     */
    Optional<Transaction> findByTransactionUniqueNo(String transactionUniqueNo);

    // ============== 통계용 쿼리 메서드들 ==============

    /**
     * 가게별 전체 누적 실제 결제금액 (SettlementTask 기준)
     */
    @Query("SELECT COALESCE(SUM(st.actualPaymentAmount), 0) " +
           "FROM SettlementTask st " +
           "JOIN st.transaction t " +
           "WHERE t.store.storeId = :storeId " +
           "AND t.transactionType = 'CHARGE'")
    Long getTotalPaymentAmountByStore(@Param("storeId") Long storeId);

    /**
     * 가게별 전체 누적 총 충전 포인트 금액 (보너스 포함)
     */
    @Query("SELECT COALESCE(SUM(t.amount), 0) " +
           "FROM Transaction t " +
           "WHERE t.store.storeId = :storeId " +
           "AND t.transactionType = 'CHARGE'")
    Long getTotalChargePointsByStore(@Param("storeId") Long storeId);

    /**
     * 가게별 전체 누적 포인트 사용량
     */
    @Query("SELECT COALESCE(SUM(t.amount), 0) " +
           "FROM Transaction t " +
           "WHERE t.store.storeId = :storeId " +
           "AND t.transactionType = 'USE'")
    Long getTotalPointsUsedByStore(@Param("storeId") Long storeId);

    /**
     * 가게별 전체 거래 건수
     */
    @Query("SELECT COUNT(t) " +
           "FROM Transaction t " +
           "WHERE t.store.storeId = :storeId")
    Long getTotalTransactionCountByStore(@Param("storeId") Long storeId);

    /**
     * 가게별 전체 충전 건수
     */
    @Query("SELECT COUNT(t) " +
           "FROM Transaction t " +
           "WHERE t.store.storeId = :storeId " +
           "AND t.transactionType = 'CHARGE'")
    Long getTotalChargeCountByStore(@Param("storeId") Long storeId);

    /**
     * 가게별 전체 사용 건수
     */
    @Query("SELECT COUNT(t) " +
           "FROM Transaction t " +
           "WHERE t.store.storeId = :storeId " +
           "AND t.transactionType = 'USE'")
    Long getTotalUseCountByStore(@Param("storeId") Long storeId);

    /**
     * 가게별 특정 날짜 실제 결제금액
     */
    @Query("SELECT COALESCE(SUM(st.actualPaymentAmount), 0) " +
           "FROM SettlementTask st " +
           "JOIN st.transaction t " +
           "WHERE t.store.storeId = :storeId " +
           "AND t.transactionType = 'CHARGE' " +
           "AND DATE(t.createdAt) = :date")
    Long getDailyPaymentAmountByStore(@Param("storeId") Long storeId, @Param("date") LocalDate date);

    /**
     * 가게별 특정 날짜 총 충전 포인트 금액 (보너스 포함)
     */
    @Query("SELECT COALESCE(SUM(t.amount), 0) " +
           "FROM Transaction t " +
           "WHERE t.store.storeId = :storeId " +
           "AND t.transactionType = 'CHARGE' " +
           "AND DATE(t.createdAt) = :date")
    Long getDailyTotalChargePointsByStore(@Param("storeId") Long storeId, @Param("date") LocalDate date);

    /**
     * 가게별 특정 날짜 포인트 사용량
     */
    @Query("SELECT COALESCE(SUM(t.amount), 0) " +
           "FROM Transaction t " +
           "WHERE t.store.storeId = :storeId " +
           "AND t.transactionType = 'USE' " +
           "AND DATE(t.createdAt) = :date")
    Long getDailyPointsUsedByStore(@Param("storeId") Long storeId, @Param("date") LocalDate date);

    /**
     * 가게별 특정 날짜 충전 건수
     */
    @Query("SELECT COUNT(t) " +
           "FROM Transaction t " +
           "WHERE t.store.storeId = :storeId " +
           "AND t.transactionType = 'CHARGE' " +
           "AND DATE(t.createdAt) = :date")
    Long getDailyChargeCountByStore(@Param("storeId") Long storeId, @Param("date") LocalDate date);

    /**
     * 가게별 특정 날짜 사용 건수
     */
    @Query("SELECT COUNT(t) " +
           "FROM Transaction t " +
           "WHERE t.store.storeId = :storeId " +
           "AND t.transactionType = 'USE' " +
           "AND DATE(t.createdAt) = :date")
    Long getDailyUseCountByStore(@Param("storeId") Long storeId, @Param("date") LocalDate date);

    /**
     * 가게별 특정 날짜 전체 거래 건수 (충전, 취소, 사용, 회수 포함)
     */
    @Query("SELECT COUNT(t) " +
           "FROM Transaction t " +
           "WHERE t.store.storeId = :storeId " +
           "AND DATE(t.createdAt) = :date")
    Long getDailyTransactionCountByStore(@Param("storeId") Long storeId, @Param("date") LocalDate date);

    /**
     * 가게별 기간별 실제 결제금액
     */
    @Query("SELECT COALESCE(SUM(st.actualPaymentAmount), 0) " +
           "FROM SettlementTask st " +
           "JOIN st.transaction t " +
           "WHERE t.store.storeId = :storeId " +
           "AND t.transactionType = 'CHARGE' " +
           "AND DATE(t.createdAt) BETWEEN :startDate AND :endDate")
    Long getPeriodPaymentAmountByStore(@Param("storeId") Long storeId,
                                       @Param("startDate") LocalDate startDate,
                                       @Param("endDate") LocalDate endDate);

    /**
     * 가게별 기간별 총 충전 포인트 금액 (보너스 포함)
     */
    @Query("SELECT COALESCE(SUM(t.amount), 0) " +
           "FROM Transaction t " +
           "WHERE t.store.storeId = :storeId " +
           "AND t.transactionType = 'CHARGE' " +
           "AND DATE(t.createdAt) BETWEEN :startDate AND :endDate")
    Long getPeriodTotalChargePointsByStore(@Param("storeId") Long storeId,
                                           @Param("startDate") LocalDate startDate,
                                           @Param("endDate") LocalDate endDate);

    /**
     * 가게별 기간별 포인트 사용량
     */
    @Query("SELECT COALESCE(SUM(t.amount), 0) " +
           "FROM Transaction t " +
           "WHERE t.store.storeId = :storeId " +
           "AND t.transactionType = 'USE' " +
           "AND DATE(t.createdAt) BETWEEN :startDate AND :endDate")
    Long getPeriodPointsUsedByStore(@Param("storeId") Long storeId,
                                    @Param("startDate") LocalDate startDate,
                                    @Param("endDate") LocalDate endDate);

    /**
     * 가게별 기간별 충전 건수
     */
    @Query("SELECT COUNT(t) " +
           "FROM Transaction t " +
           "WHERE t.store.storeId = :storeId " +
           "AND t.transactionType = 'CHARGE' " +
           "AND DATE(t.createdAt) BETWEEN :startDate AND :endDate")
    Long getPeriodChargeCountByStore(@Param("storeId") Long storeId,
                                     @Param("startDate") LocalDate startDate,
                                     @Param("endDate") LocalDate endDate);

    /**
     * 가게별 기간별 사용 건수
     */
    @Query("SELECT COUNT(t) " +
           "FROM Transaction t " +
           "WHERE t.store.storeId = :storeId " +
           "AND t.transactionType = 'USE' " +
           "AND DATE(t.createdAt) BETWEEN :startDate AND :endDate")
    Long getPeriodUseCountByStore(@Param("storeId") Long storeId,
                                  @Param("startDate") LocalDate startDate,
                                  @Param("endDate") LocalDate endDate);

    /**
     * 가게별 기간별 전체 거래 건수 (충전, 취소, 사용, 회수 포함)
     */
    @Query("SELECT COUNT(t) " +
           "FROM Transaction t " +
           "WHERE t.store.storeId = :storeId " +
           "AND DATE(t.createdAt) BETWEEN :startDate AND :endDate")
    Long getPeriodTransactionCountByStore(@Param("storeId") Long storeId,
                                          @Param("startDate") LocalDate startDate,
                                          @Param("endDate") LocalDate endDate);

    // ============== 월별 통계용 쿼리 메서드들 ==============

    /**
     * 가게별 특정 연월 실제 결제금액
     */
    @Query("SELECT COALESCE(SUM(st.actualPaymentAmount), 0) " +
           "FROM SettlementTask st " +
           "JOIN st.transaction t " +
           "WHERE t.store.storeId = :storeId " +
           "AND t.transactionType = 'CHARGE' " +
           "AND YEAR(t.createdAt) = :year " +
           "AND MONTH(t.createdAt) = :month")
    Long getMonthlyPaymentAmountByStore(@Param("storeId") Long storeId,
                                        @Param("year") int year,
                                        @Param("month") int month);

    /**
     * 가게별 특정 연월 총 충전 포인트 금액 (보너스 포함)
     */
    @Query("SELECT COALESCE(SUM(t.amount), 0) " +
           "FROM Transaction t " +
           "WHERE t.store.storeId = :storeId " +
           "AND t.transactionType = 'CHARGE' " +
           "AND YEAR(t.createdAt) = :year " +
           "AND MONTH(t.createdAt) = :month")
    Long getMonthlyTotalChargePointsByStore(@Param("storeId") Long storeId,
                                            @Param("year") int year,
                                            @Param("month") int month);

    /**
     * 가게별 특정 연월 포인트 사용량
     */
    @Query("SELECT COALESCE(SUM(t.amount), 0) " +
           "FROM Transaction t " +
           "WHERE t.store.storeId = :storeId " +
           "AND t.transactionType = 'USE' " +
           "AND YEAR(t.createdAt) = :year " +
           "AND MONTH(t.createdAt) = :month")
    Long getMonthlyPointsUsedByStore(@Param("storeId") Long storeId,
                                     @Param("year") int year,
                                     @Param("month") int month);

    /**
     * 가게별 특정 연월 충전 건수
     */
    @Query("SELECT COUNT(t) " +
           "FROM Transaction t " +
           "WHERE t.store.storeId = :storeId " +
           "AND t.transactionType = 'CHARGE' " +
           "AND YEAR(t.createdAt) = :year " +
           "AND MONTH(t.createdAt) = :month")
    Long getMonthlyChargeCountByStore(@Param("storeId") Long storeId,
                                      @Param("year") int year,
                                      @Param("month") int month);

    /**
     * 가게별 특정 연월 사용 건수
     */
    @Query("SELECT COUNT(t) " +
           "FROM Transaction t " +
           "WHERE t.store.storeId = :storeId " +
           "AND t.transactionType = 'USE' " +
           "AND YEAR(t.createdAt) = :year " +
           "AND MONTH(t.createdAt) = :month")
    Long getMonthlyUseCountByStore(@Param("storeId") Long storeId,
                                   @Param("year") int year,
                                   @Param("month") int month);

    /**
     * 가게별 특정 연월 전체 거래 건수 (충전, 취소, 사용, 회수 포함)
     */
    @Query("SELECT COUNT(t) " +
           "FROM Transaction t " +
           "WHERE t.store.storeId = :storeId " +
           "AND YEAR(t.createdAt) = :year " +
           "AND MONTH(t.createdAt) = :month")
    Long getMonthlyTransactionCountByStore(@Param("storeId") Long storeId,
                                           @Param("year") int year,
                                           @Param("month") int month);
}