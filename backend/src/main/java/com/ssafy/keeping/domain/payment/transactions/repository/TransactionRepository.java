package com.ssafy.keeping.domain.payment.transactions.repository;

import com.ssafy.keeping.domain.payment.transactions.constant.TransactionType;
import com.ssafy.keeping.domain.payment.transactions.model.Transaction;
import io.lettuce.core.dynamic.annotation.Param;
import jakarta.persistence.LockModeType;
import jakarta.persistence.QueryHint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.QueryHints;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    
    /**
     * transactionUniqueNo로 거래 조회
     */
    Optional<Transaction> findByTransactionUniqueNo(String transactionUniqueNo);

    /**
     * PK로 조회 + 쓰기 락 (SELECT ... FOR UPDATE)
     * - 동시성 하에서 동일 TX를 중복 취소/변경하지 않도록 보호!!!
     * - 락 타임아웃은 상황에 맞게 조절(아래 5초 예시)
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @QueryHints({
            @QueryHint(name = "jakarta.persistence.lock.timeout", value = "5000")
    })
    @Query("select t from Transaction t where t.transactionId = :id")
    Optional<Transaction> findByIdWithLock(@Param("id") Long id);

    /**
     * 이 원거래(refTxId)를 참조하는 특정 타입의 트랜잭션 존재 여부(빠른 존재 체크)
     */
    @Query("""
        select (count(t) > 0)
        from Transaction t
        where t.refTransaction.transactionId = :refTxId
          and t.transactionType = :type
    """)
    boolean existsByRefTxIdAndType(@Param("refTxId") Long refTxId,
                                   @Param("type") TransactionType type);

    /**
     * 이 원거래(refTxId)를 참조하는 특정 타입의 트랜잭션 단건 조회(우호적 재생용)
     */
    @Query("""
        select t
        from Transaction t
        where t.refTransaction.transactionId = :refTxId
          and t.transactionType = :type
    """)
    Optional<Transaction> findCancelByRef(@Param("refTxId") Long refTxId,
                                          @Param("type") TransactionType type);
}