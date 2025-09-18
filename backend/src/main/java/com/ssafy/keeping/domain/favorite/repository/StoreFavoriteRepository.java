package com.ssafy.keeping.domain.favorite.repository;

import com.ssafy.keeping.domain.favorite.model.StoreFavorite;
import com.ssafy.keeping.domain.user.customer.model.Customer;
import com.ssafy.keeping.domain.store.model.Store;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StoreFavoriteRepository extends JpaRepository<StoreFavorite, Long> {

    @Query("""
        select sf from StoreFavorite sf
        where sf.customer.customerId = :customerId
        and sf.store.storeId = :storeId
        """)
    Optional<StoreFavorite> findByCustomerIdAndStoreId(
            @Param("customerId") Long customerId,
            @Param("storeId") Long storeId);

    @Query("""
        select sf from StoreFavorite sf
        where sf.customer.customerId = :customerId
        and sf.store.storeId = :storeId
        and sf.canceledAt is null
        """)
    Optional<StoreFavorite> findActiveByCustomerIdAndStoreId(
            @Param("customerId") Long customerId,
            @Param("storeId") Long storeId);

    @Query("""
        select new com.ssafy.keeping.domain.favorite.dto.FavoriteStoreDetailDto(
            s.storeId,
            s.storeName,
            s.category,
            s.address,
            s.imgUrl,
            sf.favoriteNumber,
            sf.createdAt
        )
        from StoreFavorite sf
        join sf.store s
        where sf.customer.customerId = :customerId
        and sf.canceledAt is null
        order by sf.createdAt desc
        """)
    Page<com.ssafy.keeping.domain.favorite.dto.FavoriteStoreDetailDto> findActiveFavoritesByCustomerId(
            @Param("customerId") Long customerId,
            Pageable pageable);

    @Query("""
        select case when count(sf) > 0 then true else false end
        from StoreFavorite sf
        where sf.customer.customerId = :customerId
        and sf.store.storeId = :storeId
        and sf.canceledAt is null
        """)
    boolean existsActiveByCustomerIdAndStoreId(
            @Param("customerId") Long customerId,
            @Param("storeId") Long storeId);

    @Query("""
        select count(sf)
        from StoreFavorite sf
        where sf.customer.customerId = :customerId
        and sf.canceledAt is null
        """)
    long countActiveFavoritesByCustomerId(@Param("customerId") Long customerId);
}