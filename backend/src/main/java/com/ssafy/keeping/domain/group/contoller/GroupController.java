package com.ssafy.keeping.domain.group.contoller;

import com.ssafy.keeping.domain.group.dto.GroupAddRequestResponseDto;
import com.ssafy.keeping.domain.group.dto.GroupMemberResponseDto;
import com.ssafy.keeping.domain.group.dto.GroupRequestDto;
import com.ssafy.keeping.domain.group.dto.GroupResponseDto;
import com.ssafy.keeping.domain.group.service.GroupService;
import com.ssafy.keeping.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/groups")
@RequiredArgsConstructor
public class GroupController {
    private final GroupService groupService;

    @PostMapping()
    public ResponseEntity<ApiResponse<GroupResponseDto>> createGroup(
            @Valid @RequestBody GroupRequestDto requestDto
    ) {
        GroupResponseDto dto = groupService.createGroup(requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success( "모임이 생성되었습니다.", HttpStatus.CREATED.value(), dto));
    }

    // 임의 user id로 체킹
    @GetMapping("/{groupId}/{userId}")
    public ResponseEntity<ApiResponse<GroupResponseDto>> getGroup(
            @PathVariable Long userId,
            @PathVariable Long groupId
    ) {GroupResponseDto dto = groupService.getGroup(groupId, userId);
        return ResponseEntity.ok(ApiResponse.success("해당 모임이 조회되었습니다.", HttpStatus.OK.value(), dto));
    }

    // 임의 user id로 체킹
    @GetMapping("/{groupId}/{userId}/group-members")
    public ResponseEntity<ApiResponse<List<GroupMemberResponseDto>>> getGroupMembers(
            @PathVariable Long userId,
            @PathVariable Long groupId
    ) {
        List<GroupMemberResponseDto> dtos = groupService.getGroupMembers(groupId, userId);
        return ResponseEntity.ok(ApiResponse.success("해당 모임의 모임원들이 조회되었습니다.", HttpStatus.OK.value(), dtos));
    }

    // 임의 user id로 체킹
    @PostMapping("/{groupId}/{userId}/add-requests")
    public ResponseEntity<ApiResponse<Void>> createGroupAddRequest(
            @PathVariable Long userId,
            @PathVariable Long groupId
    ) {
        groupService.createGroupAddRequest(groupId, userId);
        return ResponseEntity.ok(ApiResponse.success("해당 모임에 추가 신청을 완료했습니다.", HttpStatus.OK.value(), null));
    }

    // 임의 user id로 체킹
    @GetMapping("/{groupId}/{userId}/add-requests")
    public ResponseEntity<ApiResponse<List<GroupAddRequestResponseDto>>> getAllGroupAddRequest(
            @PathVariable Long userId,
            @PathVariable Long groupId
    ) {
        List<GroupAddRequestResponseDto> dtos = groupService.getAllGroupAddRequest(groupId, userId);
        return ResponseEntity.ok(ApiResponse.success("모임 신청 내역을 조회했습니다.", HttpStatus.OK.value(), dtos));
    }

//    // TODO: 회원 Principal 적용할 controller,
//        1. 모임 정보 조회,
//        2. 모임원 조회
//        3. 모임 추가 신청
//        4. 모임 추가 신청 목록 조회
//    @GetMapping("/{groupId}")
//    public ResponseEntity<ApiResponse<GroupResponseDto>> getGroup(
//            @PathVariable Long groupId
//    ) {GroupResponseDto dto = groupService.getGroup(groupId);
//        return ResponseEntity.ok(ApiResponse.success("해당 모임이 조회되었습니다.", HttpStatus.OK.value(), dto));
//    }
}
