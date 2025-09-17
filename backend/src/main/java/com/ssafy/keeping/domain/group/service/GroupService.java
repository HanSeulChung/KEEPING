package com.ssafy.keeping.domain.group.service;

import com.ssafy.keeping.domain.customer.model.Customer;
import com.ssafy.keeping.domain.customer.repository.CustomerRepository;
import com.ssafy.keeping.domain.core.wallet.dto.WalletResponseDto;
import com.ssafy.keeping.domain.core.wallet.service.WalletServiceHS;
import com.ssafy.keeping.domain.group.constant.RequestStatus;
import com.ssafy.keeping.domain.group.dto.*;
import com.ssafy.keeping.domain.group.model.Group;
import com.ssafy.keeping.domain.group.model.GroupAddRequest;
import com.ssafy.keeping.domain.group.model.GroupMember;
import com.ssafy.keeping.domain.group.repository.GroupAddRequestRepository;
import com.ssafy.keeping.domain.group.repository.GroupMemberRepository;
import com.ssafy.keeping.domain.group.repository.GroupRepository;
import com.ssafy.keeping.global.exception.CustomException;
import com.ssafy.keeping.global.exception.constants.ErrorCode;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GroupService {
    private static final int MAX_RETRY = 5;

    private final WalletServiceHS walletService;
    private final CustomerRepository customerRepository;
    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final GroupAddRequestRepository groupAddRequestRepository;

    public GroupResponseDto createGroup(GroupRequestDto requestDto) {
        // TODO: 회원부분 연동되면 바꿔야하는 부분
        Customer customer = validCustomer(requestDto.getGroupLeaderId());

        String groupName = requestDto.getGroupName();
        String groupDescription = (requestDto.getGroupDescription() == null || requestDto.getGroupDescription().isBlank())
                ? String.format("%s의 모임입니다.", groupName)
                : requestDto.getGroupDescription();

        Group saved = null;
        for (int i = 0; i < MAX_RETRY; i++) {
            String inviteCode = makeGroupCode();
            try {
                saved = groupRepository.save(
                        Group.builder()
                                .groupName(groupName)
                                .groupDescription(groupDescription)
                                .groupCode(inviteCode)
                                .build()
                );
                break;
            } catch (DataIntegrityViolationException e) {
                if (i == MAX_RETRY - 1) throw e; // 유니크 충돌 반복 시 최종 에러
            }
        }

        groupMemberRepository.save(
                GroupMember.builder()
                        .group(saved)
                        .user(customer)
                        .leader(true)
                        .build()
        );

        // 해당 모임의 지갑 생성 로직 추가
        WalletResponseDto responseDto = walletService.createGroupWallet(saved);

        return new GroupResponseDto(
                saved.getGroupId(), saved.getGroupName(),
                saved.getGroupDescription(), saved.getGroupCode(),
                responseDto.walletId().longValue() // TODO: 지갑 ID로 교체
        );
    }

    public GroupResponseDto getGroup(Long groupId, Long userId) {
        Group group = validGroup(groupId);

        boolean isGroupMember = groupMemberRepository
                                .existsMember(groupId, userId);
        if (!isGroupMember)
            throw new CustomException(ErrorCode.ONLY_GROUP_MEMBER);

        WalletResponseDto groupWallet = walletService.getGroupWallet(group);

        return new GroupResponseDto(
                group.getGroupId(), group.getGroupName(),
                group.getGroupDescription(), group.getGroupCode(),
                groupWallet.walletId()
        );
    }

    public List<GroupMemberResponseDto> getGroupMembers(Long groupId, Long customerId) {
       validGroup(groupId);

        boolean isGroupMember = groupMemberRepository
                .existsMember(groupId, customerId);

        if (!isGroupMember)
            throw new CustomException(ErrorCode.ONLY_GROUP_MEMBER);

        return groupMemberRepository.findAllGroupMembers(groupId);
    }

    public void createGroupAddRequest(Long groupId, Long customerId) {
        Group group = validGroup(groupId);

        boolean isGroupMember = groupMemberRepository
                .existsMember(groupId, customerId);
        if (isGroupMember)
            throw new CustomException(ErrorCode.ALREADY_GROUP_MEMBER);

        Customer customer = validCustomer(customerId);

        boolean alreadyRequest = groupAddRequestRepository
                .existsRequest(groupId, customerId, RequestStatus.PENDING);

        if (alreadyRequest) throw new CustomException(ErrorCode.ALREADY_GROUP_REQUEST);

        groupAddRequestRepository.save(
                GroupAddRequest.builder()
                        .user(customer)
                        .group(group)
                        .build()
        );

    }

    private String makeGroupCode() {
        return UUID.randomUUID()
                .toString()
                .replace("-", "")
                .substring(0, 12)
                .toUpperCase();
    }

    public List<AddRequestResponseDto> getAllGroupAddRequest(Long groupId, Long customerId) {
       validGroup(groupId);

        boolean isGroupLeader = groupMemberRepository
                .existsLeader(groupId, customerId);
        if (!isGroupLeader)
            throw new CustomException(ErrorCode.ONLY_GROUP_LEADER);

        return groupAddRequestRepository.findAllAddRequestInPending(groupId, RequestStatus.PENDING);
    }

    @Transactional
    public AddRequestResponseDto updateAddRequestStatus(Long groupId, Long customerId, @Valid AddRequestDecisionDto request) {
        Group group = validGroup(groupId);

        Long groupAddRequestId = request.getGroupAddRequestId();

        GroupAddRequest groupAddRequest = groupAddRequestRepository.findById(groupAddRequestId)
                .orElseThrow(
                () -> new CustomException(ErrorCode.ADD_REQUEST_NOT_FOUND)
        );

        Customer customer = validCustomer(customerId);

        boolean isGroupLeader = groupMemberRepository
                .existsLeader(groupId, customerId);
        if (!isGroupLeader)
            throw new CustomException(ErrorCode.ONLY_GROUP_LEADER);


        if (groupAddRequest.getRequestStatus() != RequestStatus.PENDING)
            throw new CustomException(ErrorCode.ALREADY_PROCESS_REQUEST);

        RequestStatus changeStatus = request.getIsAccept() == Boolean.TRUE
                ? RequestStatus.ACCEPT : RequestStatus.REJECT;
        groupAddRequest.changeStatus(changeStatus);

        if (groupAddRequest.getRequestStatus() == RequestStatus.ACCEPT) {
            groupMemberRepository.save(
                    GroupMember.builder()
                            .group(group)
                            .leader(false)
                            .user(customer)
                            .build()
            );
        }

        return new AddRequestResponseDto(
            groupAddRequest.getGroupAddRequestId(), groupAddRequest.getUser().getName(),
                groupAddRequest.getRequestStatus()
        );
    }

    public GroupResponseDto createGroupMember(Long groupId, Long userId, GroupEntranceRequestDto requestDto) {
        Group group = validGroup(groupId);

        boolean isGroupMember = groupMemberRepository
                .existsMember(groupId, userId);

        WalletResponseDto groupWallet = walletService.getGroupWallet(group);

        if (isGroupMember) {
            return new GroupResponseDto(
                    group.getGroupId(), group.getGroupName(),
                    group.getGroupDescription(), group.getGroupCode(),
                    groupWallet.walletId());
        }

        /* TODO: 복사해서 줄때 복사 날짜 시간을 접미사로 얹어서 주면,
            일정 시간이 지나면 안되게도 할 건지 논의 필요
        * */
        String groupCode = groupRepository.findGroupCodeById(groupId);
        if (!Objects.equals(groupCode, requestDto.getInviteCode()))
            throw new CustomException(ErrorCode.CODE_NOT_MATCH);

        Customer user = validCustomer(userId);

        groupMemberRepository.save(
                GroupMember.builder()
                        .group(group)
                        .leader(false)
                        .user(user)
                        .build()
        );

        return new GroupResponseDto(
                group.getGroupId(), group.getGroupName(),
                group.getGroupDescription(), group.getGroupCode(),
                group.getGroupId() // TODO: 지갑 ID로 교체
        );

    }

    public List<GroupMaskingResponseDto> getSearchGroup(String name) {
        // TODO: 고객만 모임을 검색할 수 있게 change
        return groupRepository.findGroupsByName(name);
    }

    @Transactional
    public GroupLeaderChangeResponseDto changeGroupLeader(Long groupId, Long userId, @Valid GroupLeaderChangeRequestDto requestDto) {
        validGroup(groupId);
        validCustomer(userId);

        Long newLeaderUserId = requestDto.getNewGroupLeaderId();
        GroupMember originGroupLeader = validGroupMember(groupId, userId);
        GroupMember newGroupLeader = validGroupMember(groupId, newLeaderUserId);

        if (!originGroupLeader.isLeader())
            throw new CustomException(ErrorCode.ONLY_GROUP_LEADER);

        if (!originGroupLeader.changeLeader(false)
                || !newGroupLeader.changeLeader(true)) {
            throw new CustomException(ErrorCode.BAD_REQUEST);
        }

        return new GroupLeaderChangeResponseDto(
                groupId, newGroupLeader.getGroupMemberId(), newGroupLeader.getUser().getName()
        );
    }

    private Group validGroup(Long groupId) {
        return groupRepository.findById(groupId).orElseThrow(
                () -> new CustomException(ErrorCode.GROUP_NOT_FOUND));
    }

    private GroupMember validGroupMember(Long groupId, Long userId) {
        return groupMemberRepository.findGroupMember(groupId, userId).orElseThrow(
                () -> new CustomException(ErrorCode.GROUP_MEMBER_NOT_FOUND)
        );
    }

    private Customer validCustomer(Long customerId) {
        return customerRepository.findById(customerId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
    }
}
