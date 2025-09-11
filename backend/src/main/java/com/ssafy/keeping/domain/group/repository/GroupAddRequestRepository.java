package com.ssafy.keeping.domain.group.repository;

import com.ssafy.keeping.domain.group.constant.RequestStatus;
import com.ssafy.keeping.domain.group.model.GroupAddRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface GroupAddRequestRepository extends JpaRepository<GroupAddRequest, Long> {

    @Query("""
    select count(gr) > 0
    from GroupAddRequest gr
    where gr.group.groupId = :groupId
      and gr.user.userId  = :userId
      and gr.requestStatus = :status
    """)
    boolean existsRequest(@Param("groupId") Long groupId, @Param("userId") Long userId,
                          @Param("status") RequestStatus status);
}
