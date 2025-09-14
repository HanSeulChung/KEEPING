package com.ssafy.keeping.domain.core.wallet.repository;

import com.ssafy.keeping.domain.core.wallet.model.WalletStoreLot;
import com.ssafy.keeping.domain.core.transaction.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WalletStoreLotRepository extends JpaRepository<WalletStoreLot, Long> {
    
    Optional<WalletStoreLot> findByOriginChargeTransaction(Transaction originChargeTransaction);
}