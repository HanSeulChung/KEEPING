package com.ssafy.keeping.domain.charge.repository;

import com.ssafy.keeping.domain.charge.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {

    /**
     * 이메일로 고객 조회
     */
    Optional<Customer> findByEmail(String email);

    /**
     * 전화번호로 고객 조회
     */
    Optional<Customer> findByPhoneNumber(String phoneNumber);

    /**
     * Provider ID와 Provider Type으로 고객 조회
     */
    Optional<Customer> findByProviderIdAndProviderType(String providerId, Customer.ProviderType providerType);

    /**
     * 삭제되지 않은 고객인지 확인
     */
    boolean existsByCustomerIdAndDeletedAtIsNull(Long customerId);
}