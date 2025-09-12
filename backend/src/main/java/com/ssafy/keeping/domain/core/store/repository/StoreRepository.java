package com.ssafy.keeping.domain.core.store.repository;

import com.ssafy.keeping.domain.core.store.model.Store;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StoreRepository extends JpaRepository<Store, Long> {
}