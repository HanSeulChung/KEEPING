package com.ssafy.keeping.domain.menu.repository;

import com.ssafy.keeping.domain.menu.dto.MenuResponseDto;
import com.ssafy.keeping.domain.menu.model.Menu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MenuRepository extends JpaRepository<Menu, Long> {
    @Query("""
    select coalesce(max(m.displayOrder), -1) + 1
    from Menu m
    where m.store.storeId = :storeId
    and m.category.categoryId = :categoryId
    """)
    Integer nextOrder(@Param("storeId") Long storeId, @Param("categoryId") Long categoryId);

    Optional<Menu> findByMenuIdAndStore_StoreId(Long menuId, Long storeId);

    @Query("""
    select new com.ssafy.keeping.domain.menu.dto.MenuResponseDto(
        m.menuId, m.store.storeId, m.menuName, m.category.categoryId,
        m.category.categoryName, m.displayOrder, m.soldOut
    )
    from Menu m
    where m.store.storeId = :storeId
    and m.active
    """)
    List<MenuResponseDto> findAllMenusByStoreId(Long storeId);
}
