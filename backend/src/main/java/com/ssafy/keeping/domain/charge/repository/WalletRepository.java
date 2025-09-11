package com.ssafy.keeping.domain.charge.repository;

import com.ssafy.keeping.domain.charge.entity.Customer;
import com.ssafy.keeping.domain.charge.entity.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WalletRepository extends JpaRepository<Wallet, Long> {

    /**
     * 고객과 지갑 타입으로 지갑 조회
     */
    Optional<Wallet> findByCustomerAndWalletType(Customer customer, Wallet.WalletType walletType);

    /**
     * 고객의 모든 지갑 조회
     */
    List<Wallet> findByCustomer(Customer customer);

    /**
     * 그룹 ID로 지갑 조회
     */
    Optional<Wallet> findByGroupId(Long groupId);

    /**
     * 고객의 개인 지갑 조회
     */
    default Optional<Wallet> findIndividualWalletByCustomer(Customer customer) {
        return findByCustomerAndWalletType(customer, Wallet.WalletType.INDIVIDUAL);
    }

    /**
     * 고객의 그룹 지갑 목록 조회
     */
    default List<Wallet> findGroupWalletsByCustomer(Customer customer) {
        return findByCustomer(customer).stream()
                .filter(wallet -> wallet.getWalletType() == Wallet.WalletType.GROUP)
                .toList();
    }
}