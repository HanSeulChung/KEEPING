package com.ssafy.keeping.domain.charge.repository;

import com.ssafy.keeping.domain.charge.entity.Store;
import com.ssafy.keeping.domain.charge.entity.Wallet;
import com.ssafy.keeping.domain.charge.entity.WalletStoreLot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface WalletStoreLotRepository extends JpaRepository<WalletStoreLot, Long> {

    /**
     * 지갑과 가게로 포인트 묶음 조회 (만료일 순으로 정렬)
     */
    List<WalletStoreLot> findByWalletAndStoreOrderByExpiredAtAsc(Wallet wallet, Store store);

    /**
     * 지갑의 모든 포인트 묶음 조회
     */
    List<WalletStoreLot> findByWalletOrderByExpiredAtAsc(Wallet wallet);

    /**
     * 사용 가능한 포인트 묶음 조회 (잔액 > 0, 미만료)
     */
    @Query("SELECT wsl FROM WalletStoreLot wsl WHERE wsl.wallet = :wallet AND wsl.store = :store " +
           "AND wsl.amountRemaining > 0 AND wsl.expiredAt > :now ORDER BY wsl.expiredAt ASC")
    List<WalletStoreLot> findAvailableLots(@Param("wallet") Wallet wallet, 
                                          @Param("store") Store store, 
                                          @Param("now") LocalDateTime now);

    /**
     * 만료된 포인트 묶음 조회
     */
    @Query("SELECT wsl FROM WalletStoreLot wsl WHERE wsl.expiredAt <= :now AND wsl.amountRemaining > 0")
    List<WalletStoreLot> findExpiredLots(@Param("now") LocalDateTime now);

    /**
     * 특정 원본 거래의 포인트 묶음 조회
     */
    List<WalletStoreLot> findByOriginChargeTransaction_TransactionId(Long transactionId);

    /**
     * 지갑-가게의 총 사용 가능한 포인트 조회
     */
    @Query("SELECT COALESCE(SUM(wsl.amountRemaining), 0) FROM WalletStoreLot wsl " +
           "WHERE wsl.wallet = :wallet AND wsl.store = :store AND wsl.amountRemaining > 0 AND wsl.expiredAt > :now")
    BigDecimal getTotalAvailableAmount(@Param("wallet") Wallet wallet, 
                                      @Param("store") Store store, 
                                      @Param("now") LocalDateTime now);
}