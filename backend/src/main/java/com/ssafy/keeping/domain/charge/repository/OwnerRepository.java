package com.ssafy.keeping.domain.charge.repository;

import com.ssafy.keeping.domain.charge.entity.Owner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OwnerRepository extends JpaRepository<Owner, Long> {

    /**
     * 이메일로 점주 조회
     */
    Optional<Owner> findByEmail(String email);

    /**
     * 전화번호로 점주 조회
     */
    Optional<Owner> findByPhoneNumber(String phoneNumber);

    /**
     * 사업자등록번호로 점주 조회
     */
    Optional<Owner> findByBusinessRegistrationNumber(String businessRegistrationNumber);

    /**
     * Provider ID와 Provider Type으로 점주 조회
     */
    Optional<Owner> findByProviderIdAndProviderType(String providerId, Owner.ProviderType providerType);

    /**
     * 삭제되지 않은 점주인지 확인
     */
    boolean existsByOwnerIdAndDeletedAtIsNull(Long ownerId);
}