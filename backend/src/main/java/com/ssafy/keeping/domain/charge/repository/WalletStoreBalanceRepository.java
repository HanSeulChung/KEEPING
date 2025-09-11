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

    /**
     * 지갑의 모든 가게별 잔액 조회
     */
    List<WalletStoreBalance> findByWallet(Wallet wallet);

    /**
     * 가게의 모든 지갑별 잔액 조회
     */
    List<WalletStoreBalance> findByStore(Store store);

    /**
     * 잔액이 0보다 큰 지갑-가게 조합 조회
     */
    @Query("SELECT wsb FROM WalletStoreBalance wsb WHERE wsb.wallet = :wallet AND wsb.balance > 0")
    List<WalletStoreBalance> findByWalletWithPositiveBalance(@Param("wallet") Wallet wallet);

    /**
     * 특정 가게의 전체 잔액 합계 조회
     */
    @Query("SELECT COALESCE(SUM(wsb.balance), 0) FROM WalletStoreBalance wsb WHERE wsb.store = :store")
    BigDecimal getTotalBalanceByStore(@Param("store") Store store);

    /**
     * 특정 지갑의 전체 잔액 합계 조회
     */
    @Query("SELECT COALESCE(SUM(wsb.balance), 0) FROM WalletStoreBalance wsb WHERE wsb.wallet = :wallet")
    BigDecimal getTotalBalanceByWallet(@Param("wallet") Wallet wallet);
}