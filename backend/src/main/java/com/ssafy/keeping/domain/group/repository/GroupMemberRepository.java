package com.ssafy.keeping.domain.group.repository;

import com.ssafy.keeping.domain.group.model.GroupMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GroupMemberRepository extends JpaRepository<GroupMember, Long> {

    boolean existsByGroup_GroupIdAndUser_CustomerId(Long groupId, Long customerId);
}
