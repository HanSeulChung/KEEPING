package com.ssafy.keeping.domain.core.wallet.repository;

import com.ssafy.keeping.domain.core.wallet.model.WalletStoreLot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WalletStoreLotRepository extends JpaRepository<WalletStoreLot, Long> {
}