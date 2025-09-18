package com.ssafy.keeping.domain.wallet.repository;

import com.ssafy.keeping.domain.store.model.Store;
import com.ssafy.keeping.domain.wallet.model.Wallet;
import com.ssafy.keeping.domain.wallet.model.WalletStoreBalance;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WalletStoreBalanceRepository extends JpaRepository<WalletStoreBalance, Long> {

    /**
     * 지갑과 가게로 잔액 조회
     */
    Optional<WalletStoreBalance> findByWalletAndStore(Wallet wallet, Store store);

    @Query("""
        select b
        from WalletStoreBalance b
        join fetch b.wallet
        join fetch b.store
        where b.store.storeId=:storeId
        and b.wallet.walletId=:walletId
        """)
    Optional<WalletStoreBalance> findByWalletIdAndStoreId(@Param("walletId") Long walletId, @Param("storeId") Long storeId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        select b from WalletStoreBalance b
         where b.wallet.walletId = :walletId
           and b.store.storeId   = :storeId
    """)
    Optional<WalletStoreBalance> lockByWalletIdAndStoreId(@Param("walletId") Long walletId,
                                                          @Param("storeId") Long storeId);
    @Query("""
        select case when count(wb)>0 then true else false end
        from WalletStoreBalance wb
        where wb.store.storeId = :storeId and wb.balance > 0
    """)
    @Lock(LockModeType.PESSIMISTIC_READ)
    boolean existsPositiveBalanceForStoreWithLock(@Param("storeId") Long storeId);

}