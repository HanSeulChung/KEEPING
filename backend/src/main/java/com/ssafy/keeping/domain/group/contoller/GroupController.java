package com.ssafy.keeping.domain.group.contoller;

import com.ssafy.keeping.domain.group.constant.RequestStatus;
import com.ssafy.keeping.domain.group.dto.*;
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

    @GetMapping()
    public ResponseEntity<ApiResponse<List<GroupMaskingResponseDto>>> getSearchGroup(
            @RequestParam String name
    ) {
        List<GroupMaskingResponseDto> dtos = groupService.getSearchGroup(name);
        String message = dtos.size() == 0 ?
                "해당 이름으로 조회되는 모임이 존재하지 않습니다." : "해당 모임이 조회되었습니다.";
        return ResponseEntity.ok(ApiResponse.success(message, HttpStatus.OK.value(), dtos));
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
    public ResponseEntity<ApiResponse<List<AddRequestResponseDto>>> getAllGroupAddRequest(
            @PathVariable Long userId,
            @PathVariable Long groupId
    ) {
        List<AddRequestResponseDto> dtos = groupService.getAllGroupAddRequest(groupId, userId);
        return ResponseEntity.ok(ApiResponse.success("모임 신청 내역을 조회했습니다.", HttpStatus.OK.value(), dtos));
    }

    // 임의 user id로 체킹
    @PatchMapping("/{groupId}/{userId}/add-requests")
    public ResponseEntity<ApiResponse<AddRequestResponseDto>> updateAddRequestStatus(
            @PathVariable Long userId,
            @PathVariable Long groupId,
            @Valid @RequestBody AddRequestDecisionDto request
    ) {
        AddRequestResponseDto dto = groupService.updateAddRequestStatus(groupId, userId, request);
        String message = String.format("모임 추가 신청 %s 성공", dto.status() == RequestStatus.ACCEPT ? "승인" : "거절");
        return ResponseEntity.ok(ApiResponse.success(message, HttpStatus.OK.value(), dto));
    }

    // 임의 user id로 체킹
    @PostMapping("/{groupId}/{userId}/entrance")
    public ResponseEntity<ApiResponse<GroupResponseDto>> createGroupMember(
            @PathVariable Long userId,
            @PathVariable Long groupId,
            @Valid @RequestBody GroupEntranceRequestDto requestDto
    ) {
        GroupResponseDto dto = groupService.createGroupMember(groupId, userId, requestDto);
        return ResponseEntity.ok(ApiResponse.success("해당 모임에 입장을 완료했습니다.", HttpStatus.OK.value(), dto));
    }

//    // TODO: 회원 Principal 적용할 controller,
//        1. 모임 정보 조회,
//        2. 모임원 조회
//        3. 모임 추가 신청
//        4. 모임 추가 신청 목록 조회
//        5. 모임 추가 신청 승인 및 거절
//        6. 모임 입장(모임 코드를 이용하여)
//        7. 모임 검색 (와일드 카드 X)
//    @GetMapping("/{groupId}")
//    public ResponseEntity<ApiResponse<GroupResponseDto>> getGroup(
//            @PathVariable Long groupId
//    ) {GroupResponseDto dto = groupService.getGroup(groupId);
//        return ResponseEntity.ok(ApiResponse.success("해당 모임이 조회되었습니다.", HttpStatus.OK.value(), dto));
//    }
}
