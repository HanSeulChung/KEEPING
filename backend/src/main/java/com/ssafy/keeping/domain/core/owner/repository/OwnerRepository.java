package com.ssafy.keeping.domain.core.owner.repository;

import com.ssafy.keeping.domain.core.customer.model.Customer;
import com.ssafy.keeping.domain.core.owner.model.Owner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OwnerRepository extends JpaRepository<Owner, Long> {
    Optional<Owner> findByProviderTypeAndProviderIdAndDeletedAtIsNull(Customer.ProviderType providerType, String providerId);

}