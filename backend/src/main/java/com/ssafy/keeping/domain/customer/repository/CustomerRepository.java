package com.ssafy.keeping.domain.customer.repository;

import com.ssafy.keeping.domain.customer.model.Customer;
import com.ssafy.keeping.domain.customer.model.ProviderType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Long> {

    // 아이디로 조회
    Optional<Customer> findByCustomerIdAndDeletedAtIsNull(Long customerId);

    // 소셜 타입과 id 로 조회
    Optional<Customer> findByProviderTypeAndProviderIdAndDeletedAtIsNull(ProviderType providerType, String providerId);

    // 중복 가입 방지
    boolean existsByPhoneNumberAndDeletedAtIsNull(String phoneNumber);

    // 탈퇴한 사용자 조회(탈퇴 시점 확인용)
    Optional<Customer> findByPhoneNumberAndDeletedAtIsNotNull(String phoneNumber);

    // 전체 조회
    List<Customer> findAllByDeletedAtIsNull();

    // 핸드폰 번호로 고객 찾기
    Optional<Customer> findByPhoneNumberAndDeletedAtIsNull(String phoneNumber);

    Optional<Customer> findByPhoneNumberAndDeletedAtIsNotNullOrderByDeletedAtDesc(String phoneNumber);
}
