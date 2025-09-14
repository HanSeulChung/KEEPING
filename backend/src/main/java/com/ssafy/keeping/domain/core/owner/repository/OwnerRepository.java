package com.ssafy.keeping.domain.core.owner.repository;

import com.ssafy.keeping.domain.core.owner.model.Owner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OwnerRepository extends JpaRepository<Owner, Long> {

}