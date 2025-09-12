package com.ssafy.keeping.domain.charge.repository;

import com.ssafy.keeping.domain.charge.entity.Owner;
import com.ssafy.keeping.domain.customer.model.Customer;
import com.ssafy.keeping.domain.customer.model.ProviderType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OwnerRepository extends JpaRepository<Owner, Long> {

    // 소셜 타입과 id 로 조회
    Optional<Owner> findByProviderTypeAndProviderIdAndDeletedAtIsNull(ProviderType providerType, String providerId);

}