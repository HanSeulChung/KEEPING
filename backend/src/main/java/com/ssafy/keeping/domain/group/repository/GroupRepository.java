package com.ssafy.keeping.domain.group.repository;

import com.ssafy.keeping.domain.group.model.Group;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GroupRepository extends JpaRepository<Group, Long> {

    boolean existsByGroupCode(String code);
}
