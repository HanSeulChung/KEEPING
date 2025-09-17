package com.ssafy.keeping.domain.wallet.repository;

import com.ssafy.keeping.domain.wallet.model.WalletStoreLot;
import com.ssafy.keeping.domain.payment.transactions.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WalletStoreLotRepository extends JpaRepository<WalletStoreLot, Long> {
    
    Optional<WalletStoreLot> findByOriginChargeTransaction(Transaction originChargeTransaction);
}