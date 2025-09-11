package com.ssafy.keeping.domain.group.contoller;

import com.ssafy.keeping.domain.group.dto.GroupRequestDto;
import com.ssafy.keeping.domain.group.dto.GroupResponseDto;
import com.ssafy.keeping.domain.group.service.GroupService;
import com.ssafy.keeping.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

//    // TODO: 회원 Principal 적용할 코드
//    @GetMapping("/{groupId}")
//    public ResponseEntity<ApiResponse<GroupResponseDto>> getGroup(
//            @PathVariable Long groupId
//    ) {GroupResponseDto dto = groupService.getGroup(groupId);
//        return ResponseEntity.ok(ApiResponse.success("해당 모임이 조회되었습니다.", HttpStatus.OK.value(), dto));
//    }
}
