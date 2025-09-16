package com.ssafy.keeping.domain.core.transaction.repository;

import com.ssafy.keeping.domain.core.transaction.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    
    /**
     * transactionUniqueNo로 거래 조회
     */
    Optional<Transaction> findByTransactionUniqueNo(String transactionUniqueNo);
}