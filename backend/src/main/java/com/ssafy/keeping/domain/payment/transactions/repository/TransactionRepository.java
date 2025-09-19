package com.ssafy.keeping.domain.payment.transactions.repository;

import com.ssafy.keeping.domain.payment.transactions.model.Transaction;
import com.ssafy.keeping.domain.payment.transactions.constant.TransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    
    /**
     * transactionUniqueNo로 거래 조회
     */
    Optional<Transaction> findByTransactionUniqueNo(String transactionUniqueNo);

    // ===== 개인지갑 관련 메서드들 (SettlementTask JOIN으로 취소되지 않은 거래만) =====

    /**
     * 개인지갑 - 특정 가게의 첫 충전 조회 (취소되지 않은)
     */
    @Query("""
        SELECT t FROM Transaction t
        LEFT JOIN SettlementTask st ON st.transaction = t
        WHERE t.wallet.customer.customerId = :customerId
        AND t.wallet.walletType = 'INDIVIDUAL'
        AND t.store.storeId = :storeId
        AND t.transactionType = 'CHARGE'
        AND (st.status IS NULL OR st.status != 'CANCELED')
        ORDER BY t.createdAt ASC
        """)
    Optional<Transaction> findFirstValidChargeByCustomerAndStore(@Param("customerId") Long customerId,
                                                                @Param("storeId") Long storeId);

    /**
     * 개인지갑 - 특정 가게의 실제 포인트 증가 총액 (충전 + 회수)
     */
    @Query("""
        SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t
        LEFT JOIN SettlementTask st ON st.transaction = t
        WHERE t.wallet.customer.customerId = :customerId
        AND t.wallet.walletType = 'INDIVIDUAL'
        AND t.store.storeId = :storeId
        AND t.transactionType IN ('CHARGE', 'TRANSFER_OUT')
        AND (st.status IS NULL OR st.status != 'CANCELED')
        """)
    Long getTotalGainAmountByCustomerAndStore(@Param("customerId") Long customerId,
                                             @Param("storeId") Long storeId);

    /**
     * 개인지갑 - 특정 가게의 실제 포인트 감소 총액 (사용 + 공유)
     */
    @Query("""
        SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t
        LEFT JOIN SettlementTask st ON st.transaction = t
        WHERE t.wallet.customer.customerId = :customerId
        AND t.wallet.walletType = 'INDIVIDUAL'
        AND t.store.storeId = :storeId
        AND t.transactionType IN ('USE', 'TRANSFER_IN')
        AND (st.status IS NULL OR st.status != 'CANCELED')
        """)
    Long getTotalSpentAmountByCustomerAndStore(@Param("customerId") Long customerId,
                                              @Param("storeId") Long storeId);

    /**
     * 개인지갑 - 특정 가게의 유효한 거래내역 조회 (페이징)
     */
    @Query("""
        SELECT t FROM Transaction t
        LEFT JOIN SettlementTask st ON st.transaction = t
        WHERE t.wallet.customer.customerId = :customerId
        AND t.wallet.walletType = 'INDIVIDUAL'
        AND t.store.storeId = :storeId
        AND (st.status IS NULL OR st.status != 'CANCELED')
        ORDER BY t.createdAt DESC
        """)
    Page<Transaction> findValidTransactionsByCustomerAndStore(@Param("customerId") Long customerId,
                                                             @Param("storeId") Long storeId,
                                                             Pageable pageable);

    // ===== 모임지갑 관련 메서드들 (SettlementTask JOIN으로 취소되지 않은 거래만) =====

    /**
     * 모임지갑 - 특정 가게의 첫 공유받은 거래 조회 (취소되지 않은)
     */
    @Query("""
        SELECT t FROM Transaction t
        LEFT JOIN SettlementTask st ON st.transaction = t
        WHERE t.wallet.group.groupId = :groupId
        AND t.wallet.walletType = 'GROUP'
        AND t.store.storeId = :storeId
        AND t.transactionType = 'TRANSFER_IN'
        AND (st.status IS NULL OR st.status != 'CANCELED')
        ORDER BY t.createdAt ASC
        """)
    Optional<Transaction> findFirstValidTransferInByGroupAndStore(@Param("groupId") Long groupId,
                                                                 @Param("storeId") Long storeId);

    /**
     * 모임지갑 - 특정 가게의 실제 포인트 증가 총액 (공유받음)
     */
    @Query("""
        SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t
        LEFT JOIN SettlementTask st ON st.transaction = t
        WHERE t.wallet.group.groupId = :groupId
        AND t.wallet.walletType = 'GROUP'
        AND t.store.storeId = :storeId
        AND t.transactionType = 'TRANSFER_IN'
        AND (st.status IS NULL OR st.status != 'CANCELED')
        """)
    Long getTotalTransferInAmountByGroupAndStore(@Param("groupId") Long groupId,
                                                @Param("storeId") Long storeId);

    /**
     * 모임지갑 - 특정 가게의 실제 포인트 감소 총액 (사용 + 회수)
     */
    @Query("""
        SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t
        LEFT JOIN SettlementTask st ON st.transaction = t
        WHERE t.wallet.group.groupId = :groupId
        AND t.wallet.walletType = 'GROUP'
        AND t.store.storeId = :storeId
        AND t.transactionType IN ('USE', 'TRANSFER_OUT')
        AND (st.status IS NULL OR st.status != 'CANCELED')
        """)
    Long getTotalSpentAmountByGroupAndStore(@Param("groupId") Long groupId,
                                           @Param("storeId") Long storeId);

    /**
     * 모임지갑 - 특정 가게의 유효한 거래내역 조회 (페이징)
     */
    @Query("""
        SELECT t FROM Transaction t
        LEFT JOIN SettlementTask st ON st.transaction = t
        WHERE t.wallet.group.groupId = :groupId
        AND t.wallet.walletType = 'GROUP'
        AND t.store.storeId = :storeId
        AND (st.status IS NULL OR st.status != 'CANCELED')
        ORDER BY t.createdAt DESC
        """)
    Page<Transaction> findValidTransactionsByGroupAndStore(@Param("groupId") Long groupId,
                                                          @Param("storeId") Long storeId,
                                                          Pageable pageable);
}