package com.ssafy.keeping.domain.group.service;

import com.ssafy.keeping.domain.group.constant.RequestStatus;
import com.ssafy.keeping.domain.group.dto.*;
import com.ssafy.keeping.domain.group.model.Group;
import com.ssafy.keeping.domain.group.model.GroupAddRequest;
import com.ssafy.keeping.domain.group.model.GroupMember;
import com.ssafy.keeping.domain.group.model.TmpUser;
import com.ssafy.keeping.domain.group.repository.GroupAddRequestRepository;
import com.ssafy.keeping.domain.group.repository.GroupMemberRepository;
import com.ssafy.keeping.domain.group.repository.GroupRepository;
import com.ssafy.keeping.domain.group.repository.TmpUserRepository;
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

    private final TmpUserRepository userRepository;
    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final GroupAddRequestRepository groupAddRequestRepository;

    public GroupResponseDto createGroup(GroupRequestDto requestDto) {
        // TODO: 회원부분 연동되면 바꿔야하는 부분
        TmpUser customer = userRepository.findById(requestDto.getGroupLeaderId())
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        if ("OWNER".equalsIgnoreCase(customer.getRole())) {
            throw new CustomException(ErrorCode.INVALID_ROLE);
        }

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
                        .isLeader(true)
                        .build()
        );
        
        // 해당 모임의 지갑 생성 로직 추가

        return new GroupResponseDto(
                saved.getGroupId(), saved.getGroupName(),
                saved.getGroupDescription(), saved.getGroupCode(),
                saved.getGroupId() // TODO: 지갑 ID로 교체
        );
    }

    public GroupResponseDto getGroup(Long groupId, Long userId) {
        Group group = groupRepository.findById(groupId).orElseThrow(
                () -> new CustomException(ErrorCode.GROUP_NOT_FOUND));

        boolean isGroupMember = groupMemberRepository
                                .existsMember(groupId, userId);
        if (!isGroupMember)
            throw new CustomException(ErrorCode.ONLY_GROUP_MEMBER);

        return new GroupResponseDto(
                group.getGroupId(), group.getGroupName(),
                group.getGroupDescription(), group.getGroupCode(),
                group.getGroupId() // TODO: 지갑 ID로 교체
        );
    }

    public List<GroupMemberResponseDto> getGroupMembers(Long groupId, Long customerId) {
        Group group = groupRepository.findById(groupId).orElseThrow(
                () -> new CustomException(ErrorCode.GROUP_NOT_FOUND));

        boolean isGroupMember = groupMemberRepository
                .existsMember(groupId, customerId);

        if (!isGroupMember)
            throw new CustomException(ErrorCode.ONLY_GROUP_MEMBER);

        return groupMemberRepository.findAllGroupMembers(groupId);
    }

    public void createGroupAddRequest(Long groupId, Long customerId) {
        Group group = groupRepository.findById(groupId).orElseThrow(
                () -> new CustomException(ErrorCode.GROUP_NOT_FOUND));

        boolean isGroupMember = groupMemberRepository
                .existsMember(groupId, customerId);
        if (isGroupMember)
            throw new CustomException(ErrorCode.ALREADY_GROUP_MEMBER);

        TmpUser customer = userRepository.findById(customerId).orElseThrow(
                () -> new CustomException(ErrorCode.USER_NOT_FOUND)
        );

        if ("OWNER".equalsIgnoreCase(customer.getRole())) {
            throw new CustomException(ErrorCode.INVALID_ROLE);
        }

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
        Group group = groupRepository.findById(groupId).orElseThrow(
                () -> new CustomException(ErrorCode.GROUP_NOT_FOUND));

        boolean isGroupLeader = groupMemberRepository
                .existsLeader(groupId, customerId);
        if (!isGroupLeader)
            throw new CustomException(ErrorCode.ONLY_GROUP_LEADER);

        return groupAddRequestRepository.findAllAddRequestInPending(groupId, RequestStatus.PENDING);
    }

    @Transactional
    public AddRequestResponseDto updateAddRequestStatus(Long groupId, Long customerId, @Valid AddRequestDecisionDto request) {
        Group group = groupRepository.findById(groupId).orElseThrow(
                () -> new CustomException(ErrorCode.GROUP_NOT_FOUND));

        Long groupAddRequestId = request.getGroupAddRequestId();

        GroupAddRequest groupAddRequest = groupAddRequestRepository.findById(groupAddRequestId)
                .orElseThrow(
                () -> new CustomException(ErrorCode.ADD_REQUEST_NOT_FOUND)
        );


        TmpUser customer = userRepository.findById(groupAddRequest.getUser().getUserId())
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

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
                            .isLeader(false)
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
        Group group = groupRepository.findById(groupId).orElseThrow(
                () -> new CustomException(ErrorCode.GROUP_NOT_FOUND));

        boolean isGroupMember = groupMemberRepository
                .existsMember(groupId, userId);
        if (isGroupMember) {
            return new GroupResponseDto(
                    group.getGroupId(), group.getGroupName(),
                    group.getGroupDescription(), group.getGroupCode(),
                    group.getGroupId());// TODO: 지갑 ID로 교체
        }

        /* TODO: 복사해서 줄때 복사 날짜 시간을 접미사로 얹어서 주면,
            일정 시간이 지나면 안되게도 할 건지 논의 필요
        * */
        String groupCode = groupRepository.findGroupCodeById(groupId);
        if (!Objects.equals(groupCode, requestDto.getInviteCode()))
            throw new CustomException(ErrorCode.CODE_NOT_MATCH);

        TmpUser user = userRepository.findById(userId).orElseThrow(
                () -> new CustomException(ErrorCode.USER_NOT_FOUND)
        );

        if ("OWNER".equalsIgnoreCase(user.getRole())) {
            throw new CustomException(ErrorCode.INVALID_ROLE);
        }

        groupMemberRepository.save(
                GroupMember.builder()
                        .group(group)
                        .isLeader(false)
                        .user(user)
                        .build()
        );

        return new GroupResponseDto(
                group.getGroupId(), group.getGroupName(),
                group.getGroupDescription(), group.getGroupCode(),
                group.getGroupId() // TODO: 지갑 ID로 교체
        );

    }
}
