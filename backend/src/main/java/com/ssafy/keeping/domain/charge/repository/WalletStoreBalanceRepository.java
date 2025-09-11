package com.ssafy.keeping.domain.charge.repository;

import com.ssafy.keeping.domain.charge.entity.Store;
import com.ssafy.keeping.domain.charge.entity.Wallet;
import com.ssafy.keeping.domain.charge.entity.WalletStoreBalance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface WalletStoreBalanceRepository extends JpaRepository<WalletStoreBalance, Long> {

    /**
     * 지갑과 가게로 잔액 조회
     */
    Optional<WalletStoreBalance> findByWalletAndStore(Wallet wallet, Store store);
}