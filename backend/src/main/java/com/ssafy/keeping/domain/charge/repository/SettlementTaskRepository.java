package com.ssafy.keeping.domain.charge.repository;

import com.ssafy.keeping.domain.charge.model.SettlementTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SettlementTaskRepository extends JpaRepository<SettlementTask, Long> {

    /**
     * 이전 주의 PENDING 상태 정산 작업 조회 (월요일 07:30 실행용)
     * 지난 주 월요일 07:30부터 월요일 07:30까지의 PENDING 상태 작업
     */
    @Query("SELECT st FROM SettlementTask st WHERE st.status = 'PENDING' " +
           "AND st.createdAt >= :weekStart AND st.createdAt < :weekEnd ORDER BY st.createdAt ASC")
    List<SettlementTask> findPendingTasksFromPreviousWeek(@Param("weekStart") LocalDateTime weekStart, 
                                                          @Param("weekEnd") LocalDateTime weekEnd);

    /**
     * LOCKED 상태의 정산 작업 조회 (화요일 01:00 실행용)
     */
    @Query("SELECT st FROM SettlementTask st WHERE st.status = 'LOCKED' ORDER BY st.createdAt ASC")
    List<SettlementTask> findLockedTasks();
}