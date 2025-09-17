package com.ssafy.keeping.domain.owner.repository;

import com.ssafy.keeping.domain.auth.enums.AuthProvider;
import com.ssafy.keeping.domain.owner.model.Owner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OwnerRepository extends JpaRepository<Owner, Long> {
    Optional<Owner> findByProviderTypeAndProviderIdAndDeletedAtIsNull(AuthProvider providerType, String providerId);

    // 아이디로 조회
    Optional<Owner> findByOwnerIdAndDeletedAtIsNull(Long ownerId);

    // 중복 가입 방지
    boolean existsByPhoneNumberAndDeletedAtIsNull(String phoneNumber);

    Optional<Owner> findByPhoneNumberAndDeletedAtIsNotNullOrderByDeletedAtDesc(String phoneNumber);

}