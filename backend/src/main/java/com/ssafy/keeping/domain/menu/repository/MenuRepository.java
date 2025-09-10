package com.ssafy.keeping.domain.menu.repository;

import com.ssafy.keeping.domain.menu.model.Menu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface MenuRepository extends JpaRepository<Menu, Long> {
    @Query("""
    select coalesce(max(m.displayOrder), -1) + 1
    from Menu m
    where m.store.storeId = :storeId
    and m.category.categoryId = :categoryId
    """)
    Integer nextOrder(@Param("storeId") Long storeId, @Param("categoryId") Long categoryId);

}
