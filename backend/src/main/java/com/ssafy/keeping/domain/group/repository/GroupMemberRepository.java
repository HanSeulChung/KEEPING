package com.ssafy.keeping.domain.group.repository;

import com.ssafy.keeping.domain.group.dto.GroupMemberResponseDto;
import com.ssafy.keeping.domain.group.model.GroupMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GroupMemberRepository extends JpaRepository<GroupMember, Long> {

    boolean existsByGroup_GroupIdAndUser_UserId(Long groupId, Long userId);

    @Query("""
    select new com.ssafy.keeping.domain.group.dto.GroupMemberResponseDto(
        :groupId, u.userId, u.name, gm.isLeader, gm.groupMemberId
    )
    from GroupMember gm
    join gm.user u
    where gm.group.groupId = :groupId
    """)
    List<GroupMemberResponseDto> findAllGroupMembers(@Param("groupId") Long groupId);
}
