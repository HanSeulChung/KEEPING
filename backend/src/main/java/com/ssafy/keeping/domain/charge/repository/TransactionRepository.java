package com.ssafy.keeping.domain.charge.repository;

import com.ssafy.keeping.domain.charge.entity.Customer;
import com.ssafy.keeping.domain.charge.entity.Store;
import com.ssafy.keeping.domain.charge.entity.Transaction;
import com.ssafy.keeping.domain.charge.entity.Wallet;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    /**
     * 고객의 거래 내역 조회 (페이징)
     */
    Page<Transaction> findByCustomerOrderByCreatedAtDesc(Customer customer, Pageable pageable);

    /**
     * 지갑의 거래 내역 조회
     */
    List<Transaction> findByWalletOrderByCreatedAtDesc(Wallet wallet);

    /**
     * 가게의 거래 내역 조회
     */
    List<Transaction> findByStoreOrderByCreatedAtDesc(Store store);

    /**
     * 거래 타입별 조회
     */
    List<Transaction> findByTransactionTypeOrderByCreatedAtDesc(Transaction.TransactionType transactionType);

    /**
     * 고객의 특정 가게 거래 내역 조회
     */
    List<Transaction> findByCustomerAndStoreOrderByCreatedAtDesc(Customer customer, Store store);

    /**
     * 날짜 범위별 거래 내역 조회
     */
    @Query("SELECT t FROM Transaction t WHERE t.createdAt BETWEEN :startDate AND :endDate ORDER BY t.createdAt DESC")
    List<Transaction> findByCreatedAtBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    /**
     * 특정 가게의 CHARGE 타입 거래 합계 (정산용)
     */
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.store = :store AND t.transactionType = 'CHARGE'")
    BigDecimal getTotalChargeAmountByStore(@Param("store") Store store);
}