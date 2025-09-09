package com.ssafy.keeping.domain.store.repository;

import com.ssafy.keeping.domain.store.constant.StoreStatus;
import com.ssafy.keeping.domain.store.dto.StorePublicDto;
import com.ssafy.keeping.domain.store.dto.StoreResponseDto;
import com.ssafy.keeping.domain.store.model.Store;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StoreRepository extends JpaRepository<Store, Long> {
    @Query("""
    select new com.ssafy.keeping.domain.store.dto.StorePublicDto(
      s.storeId, s.storeName, s.address, s.phoneNumber,
      s.category, s.storeStatus, s.description, s.createdAt, s.imgUrl
    )
    from Store s
    where s.storeId = :id
      and s.storeStatus = :status
      and s.deletedAt is null
    """)
    Optional<StorePublicDto> findPublicById(@Param("id") Long id,
                                            @Param("status") StoreStatus status);
    boolean existsByTaxIdAndAddress(String taxId, String address);
    @Query("""
    select new com.ssafy.keeping.domain.store.dto.StorePublicDto(
      s.storeId, s.storeName, s.address, s.phoneNumber,
      s.category, s.storeStatus, s.description, s.createdAt, s.imgUrl
    )
    from Store s
    where s.storeStatus = :status and s.deletedAt is null
    order by s.storeId desc
    """)
    List<StorePublicDto> findPublicAllApprovedStore(@Param("status") StoreStatus status);

    @Query("""
    select new com.ssafy.keeping.domain.store.dto.StorePublicDto(
      s.storeId, s.storeName, s.address, s.phoneNumber,
      s.category, s.storeStatus, s.description, s.createdAt, s.imgUrl
    )
    from Store s
    where s.storeStatus = :status and s.deletedAt is null
      and lower(s.storeName) like lower(concat('%', :name, '%')) escape '\\'
    order by s.storeId desc
    """)
    List<StorePublicDto> findPublicAllSimilarityByName(@Param("name") String name,
                                                       @Param("status") StoreStatus status);
}
