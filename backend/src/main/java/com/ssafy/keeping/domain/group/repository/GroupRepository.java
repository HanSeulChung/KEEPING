package com.ssafy.keeping.domain.group.repository;

import com.ssafy.keeping.domain.group.model.Group;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface GroupRepository extends JpaRepository<Group, Long> {

    @Query(
    """
    select g.groupCode
    from Group g
    where g.groupId=:groupId
    """
    )
    String findGroupCodeById(@Param("groupId") Long groupId);
}
