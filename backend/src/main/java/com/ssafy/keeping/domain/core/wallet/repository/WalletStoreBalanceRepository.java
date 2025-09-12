package com.ssafy.keeping.domain.core.wallet.repository;

import com.ssafy.keeping.domain.store.model.Store;
import com.ssafy.keeping.domain.core.wallet.model.Wallet;
import com.ssafy.keeping.domain.core.wallet.model.WalletStoreBalance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WalletStoreBalanceRepository extends JpaRepository<WalletStoreBalance, Long> {

    /**
     * 지갑과 가게로 잔액 조회
     */
    Optional<WalletStoreBalance> findByWalletAndStore(Wallet wallet, Store store);
}