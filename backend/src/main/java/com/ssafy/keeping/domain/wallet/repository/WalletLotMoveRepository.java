package com.ssafy.keeping.domain.wallet.repository;

import com.ssafy.keeping.domain.wallet.model.WalletLotMove;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WalletLotMoveRepository extends JpaRepository<WalletLotMove, Long> {

    List<WalletLotMove> findByTransaction_TransactionId(Long transactionId);

    List<WalletLotMove> findByLot_LotId(Long lotId);
}
