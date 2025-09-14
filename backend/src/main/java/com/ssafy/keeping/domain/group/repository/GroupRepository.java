package com.ssafy.keeping.domain.group.repository;

import com.ssafy.keeping.domain.group.dto.GroupMaskingResponseDto;
import com.ssafy.keeping.domain.group.model.Group;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

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

    @Query(
    """
    select new com.ssafy.keeping.domain.group.dto.GroupMaskingResponseDto(
        g.groupId, g.groupName, g.groupDescription, 
        case
            when length(m.name) = 1 then '*'
            when length(m.name) = 2 then concat('*', substring(m.name, 2, 1))
            else concat('*', substring(m.name, 2, 1), '*', substring(m.name, length(m.name), 1))
        end
    )
    from Group g
    join GroupMember gm
    on gm.group.groupId=g.groupId
    join TmpUser m
    on gm.user.userId=m.userId
    where g.groupName=:name
    and gm.isLeader=true
    """
    )
    List<GroupMaskingResponseDto> findGroupsByName(String name);
}
