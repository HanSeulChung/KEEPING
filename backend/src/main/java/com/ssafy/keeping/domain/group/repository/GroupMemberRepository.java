package com.ssafy.keeping.domain.group.repository;

import com.ssafy.keeping.domain.group.model.GroupMember;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GroupMemberRepository extends JpaRepository<GroupMember, Long> {
}
