package com.ssafy.keeping.domain.group.repository;

import com.ssafy.keeping.domain.group.model.TmpUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TmpUserRepository extends JpaRepository<TmpUser, Long> {

}
