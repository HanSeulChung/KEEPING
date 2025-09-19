package com.ssafy.keeping.group;

import com.ssafy.keeping.domain.auth.enums.AuthProvider;
import com.ssafy.keeping.domain.auth.enums.Gender;
import com.ssafy.keeping.domain.group.model.Group;
import com.ssafy.keeping.domain.group.model.GroupMember;
import com.ssafy.keeping.domain.group.service.GroupService;
import com.ssafy.keeping.domain.group.repository.GroupMemberRepository;
import com.ssafy.keeping.domain.notification.entity.NotificationType;
import com.ssafy.keeping.domain.notification.service.NotificationService;
import com.ssafy.keeping.domain.user.customer.model.Customer;
import com.ssafy.keeping.global.exception.CustomException;

import com.ssafy.keeping.domain.wallet.service.WalletServiceHS;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.test.mock.mockito.SpyBean;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@SpringBootTest
class GroupServiceExpelMemberTest {

    @Autowired TransactionTemplate tx;
    @SpyBean GroupService groupService;

    @MockBean GroupMemberRepository groupMemberRepository;
    @MockBean WalletServiceHS walletService;
    @MockBean NotificationService notificationService;

    // --- helpers (엔티티 구조 반영) ---
    private Group group(long id) {
        return Group.builder().groupId(id).groupName("G"+id).groupCode("GC"+id).build();
    }

    private Customer customer(long id) {
        return Customer.builder()
                .customerId(id) // 빌더에 없으면 setter/필드 접근으로 대체
                .providerId("pid-"+id).providerType(AuthProvider.KAKAO)
                .email("u"+id+"@ex.com").phoneNumber("010-0000-"+id)
                .birth(LocalDate.of(1990,1,1)).name("U"+id).gender(Gender.MALE)
                .imgUrl("https://img/"+id+".png").userKey("UK"+id).build();
    }

    private GroupMember member(Group g, Customer u, boolean isLeader) {
        return GroupMember.builder()
                .groupMemberId(null) // 테스트에서는 식별자 불필요
                .group(g)
                .user(u)            // 중요: customerId가 아니라 Customer 엔티티
                .leader(isLeader)
                .build();
    }
    // --------------------------------

    @Test
    @DisplayName("잔액>0이면 정산 후 삭제 및 알림")
    void expel_withPositiveRemain_settle_delete_notify() {
        long groupId = 1L, leaderId = 10L, targetId = 20L;

        Group g = group(groupId);
        Customer leader = customer(leaderId);
        Customer targetUser = customer(targetId);
        GroupMember target = member(g, targetUser, false);

        // spy 내부 검증 메서드 스텁
        doReturn(g).when(groupService).validGroup(groupId);
        doReturn(target).when(groupService).validGroupMember(groupId, targetId);

        when(groupMemberRepository.existsLeader(groupId, leaderId)).thenReturn(true);
        when(walletService.getMemberSharedBalance(g, targetId)).thenReturn(100L);
        when(groupMemberRepository.findMemberIdsByGroupId(groupId)).thenReturn(List.of(leaderId, 30L));

        tx.execute(s -> { groupService.expelMember(groupId, leaderId, targetId); return null; });

        verify(walletService).settleShareToIndividual(g, targetId);
        verify(groupMemberRepository).delete(target);

        String url = "/groups/" + groupId;
        verify(notificationService).sendToCustomer(targetId, NotificationType.MEMBER_EXPELLED, "모임에서 내보내졌습니다.", url);
        verify(notificationService).sendToCustomer(leaderId, NotificationType.MEMBER_EXPELLED, "모임원이 내보내졌습니다.", url);
        verify(notificationService).sendToCustomer(30L, NotificationType.MEMBER_EXPELLED, "모임원이 내보내졌습니다.", url);
        verifyNoMoreInteractions(notificationService);
    }

    @Test
    @DisplayName("잔액=0이면 정산 호출 없음")
    void expel_withZeroRemain_delete_only_notify() {
        long groupId = 2L, leaderId = 11L, targetId = 21L;

        Group g = group(groupId);
        GroupMember target = member(g, customer(targetId), false);

        doReturn(g).when(groupService).validGroup(groupId);
        doReturn(target).when(groupService).validGroupMember(groupId, targetId);

        when(groupMemberRepository.existsLeader(groupId, leaderId)).thenReturn(true);
        when(walletService.getMemberSharedBalance(g, targetId)).thenReturn(0L);
        when(groupMemberRepository.findMemberIdsByGroupId(groupId)).thenReturn(List.of(leaderId));

        tx.execute(s -> { groupService.expelMember(groupId, leaderId, targetId); return null; });

        verify(walletService, never()).settleShareToIndividual(any(), anyLong());
        verify(groupMemberRepository).delete(target);
        verify(notificationService, times(2))
                .sendToCustomer(anyLong(), eq(NotificationType.MEMBER_EXPELLED), anyString(), eq("/groups/" + groupId));
    }

    @Test
    @DisplayName("리더 아님 → 예외")
    void notLeader_forbidden() {
        long groupId = 3L, leaderId = 12L, targetId = 22L;

        doReturn(group(groupId)).when(groupService).validGroup(groupId);
        when(groupMemberRepository.existsLeader(groupId, leaderId)).thenReturn(false);

        assertThatThrownBy(() ->
                tx.execute(s -> { groupService.expelMember(groupId, leaderId, targetId); return null; })
        ).isInstanceOf(CustomException.class);

        verify(groupMemberRepository, never()).delete(any());
        verifyNoInteractions(notificationService);
    }

    @Test
    @DisplayName("리더가 자기 자신 추방 시도 → 예외")
    void leaderExpelSelf_badRequest() {
        long groupId = 4L, leaderId = 13L;

        doReturn(group(groupId)).when(groupService).validGroup(groupId);
        when(groupMemberRepository.existsLeader(groupId, leaderId)).thenReturn(true);

        assertThatThrownBy(() ->
                tx.execute(s -> { groupService.expelMember(groupId, leaderId, leaderId); return null; })
        ).isInstanceOf(CustomException.class);

        verify(groupMemberRepository, never()).delete(any());
        verifyNoInteractions(notificationService);
    }

    @Test
    @DisplayName("대상자가 리더 → 예외")
    void targetIsLeader_badRequest() {
        long groupId = 5L, leaderId = 14L, targetId = 24L;

        Group g = group(groupId);
        GroupMember targetLeader = member(g, customer(targetId), true);

        doReturn(g).when(groupService).validGroup(groupId);
        when(groupMemberRepository.existsLeader(groupId, leaderId)).thenReturn(true);
        doReturn(targetLeader).when(groupService).validGroupMember(groupId, targetId);

        assertThatThrownBy(() ->
                tx.execute(s -> { groupService.expelMember(groupId, leaderId, targetId); return null; })
        ).isInstanceOf(CustomException.class);

        verify(groupMemberRepository, never()).delete(any());
        verifyNoInteractions(notificationService);
    }
}
