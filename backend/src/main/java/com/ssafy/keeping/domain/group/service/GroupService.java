package com.ssafy.keeping.domain.group.service;

import com.ssafy.keeping.domain.group.dto.GroupRequestDto;
import com.ssafy.keeping.domain.group.dto.GroupResponseDto;
import com.ssafy.keeping.domain.group.model.Group;
import com.ssafy.keeping.domain.group.model.GroupMember;
import com.ssafy.keeping.domain.group.model.TmpUser;
import com.ssafy.keeping.domain.group.repository.GroupMemberRepository;
import com.ssafy.keeping.domain.group.repository.GroupRepository;
import com.ssafy.keeping.domain.group.repository.TmpUserRepository;
import com.ssafy.keeping.global.exception.CustomException;
import com.ssafy.keeping.global.exception.constants.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GroupService {
    private static final int MAX_RETRY = 5;

    private final TmpUserRepository userRepository;
    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;

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

    public GroupResponseDto getGroup(Long groupId, Long customerId) {
        Group group = groupRepository.findById(groupId).orElseThrow(
                () -> new CustomException(ErrorCode.GROUP_NOT_FOUND));

        boolean isGroupMember = groupMemberRepository
                                .existsByGroup_GroupIdAndUser_CustomerId(groupId, customerId);
        if (!isGroupMember)
            throw new CustomException(ErrorCode.ONLY_GROUP_MEMBER);

        return new GroupResponseDto(
                group.getGroupId(), group.getGroupName(),
                group.getGroupDescription(), group.getGroupCode(),
                group.getGroupId() // TODO: 지갑 ID로 교체
        );
    }

    private String makeGroupCode() {
        return UUID.randomUUID()
                .toString()
                .replace("-", "")
                .substring(0, 12)
                .toUpperCase();
    }
}
