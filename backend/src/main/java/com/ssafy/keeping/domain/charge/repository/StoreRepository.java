package com.ssafy.keeping.domain.charge.repository;

import com.ssafy.keeping.domain.charge.entity.Store;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StoreRepository extends JpaRepository<Store, Long> {

    /**
     * 점주 ID로 가게 목록 조회
     */
    List<Store> findByOwnerId(Long ownerId);

    /**
     * 사업자등록번호로 가게 조회
     */
    Optional<Store> findByTaxIdNumber(String taxIdNumber);

    /**
     * 가게명으로 검색 (부분 일치)
     */
    List<Store> findByStoreNameContaining(String storeName);

    /**
     * 카테고리로 가게 목록 조회
     */
    List<Store> findByCategory(String category);

    /**
     * 주소로 가게 검색 (부분 일치)
     */
    List<Store> findByAddressContaining(String address);

    /**
     * merchant ID로 가게 조회
     */
    Optional<Store> findByMerchantId(Long merchantId);
}