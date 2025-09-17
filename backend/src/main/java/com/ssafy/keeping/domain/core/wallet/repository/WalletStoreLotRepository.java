package com.ssafy.keeping.domain.core.wallet.repository;

import com.ssafy.keeping.domain.core.wallet.model.WalletStoreLot;
import com.ssafy.keeping.domain.core.transaction.model.Transaction;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.security.core.parameters.P;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WalletStoreLotRepository extends JpaRepository<WalletStoreLot, Long> {
    
    Optional<WalletStoreLot> findByOriginChargeTransaction(Transaction originChargeTransaction);

    // 개인 LOT 소진용: FIFO + 행잠금
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
       select l from WalletStoreLot l
       where l.wallet.walletId = :walletId
         and l.store.storeId  = :storeId
       order by l.acquiredAt asc
    """)
    List<WalletStoreLot> lockAllByWalletIdAndStoreIdOrderByAcquiredAt(
            @Param("walletId") Long walletId, @Param("storeId") Long storeId);

    // 그룹 수신 LOT 누적용: 지갑/매장/원천Tx/타입으로 단일 조회
    @Query("""
       select l from WalletStoreLot l
       where l.wallet.walletId = :walletId
         and l.store.storeId  = :storeId
         and l.originChargeTransaction.transactionId = :originTxId
         and l.sourceType = :sourceType
    """)
    Optional<WalletStoreLot> findByWalletIdAndStoreIdAndOriginChargeTxIdAndSourceType(
            @Param("walletId") Long walletId,
            @Param("storeId") Long storeId,
            @Param("originTxId") Long originTxId,
            @Param("sourceType") WalletStoreLot.SourceType type);
}