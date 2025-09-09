package com.ssafy.keeping.domain.menuCategory.repository;

import com.ssafy.keeping.domain.menuCategory.model.MenuCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface MenuCategoryRepository extends JpaRepository<MenuCategory, Long> {

    @Query("""
    select coalesce(max(c.displayOrder), -1) + 1
    from MenuCategory c
    where c.store.storeId = :storeId
    and ( (:parentId is null and c.parent is null) or c.parent.categoryId = :parentId )
    """)
    Integer nextOrder(@Param("storeId") Long storeId, @Param("parentId") Long parentId);
}
