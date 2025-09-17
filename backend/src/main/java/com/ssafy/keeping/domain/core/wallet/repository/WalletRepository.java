package com.ssafy.keeping.domain.core.wallet.repository;

import com.ssafy.keeping.domain.core.customer.model.Customer;
import com.ssafy.keeping.domain.core.wallet.model.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WalletRepository extends JpaRepository<Wallet, Long> {

    /**
     * 고객과 지갑 타입으로 지갑 조회
     */
    Optional<Wallet> findByCustomerAndWalletType(Customer customer, Wallet.WalletType walletType);

    @Query(
    """
    select w
    from Wallet w
    where w.group.groupId=:groupId
    """)
    Optional<Wallet> findByGroupId(@Param("groupId") Long groupId);
}