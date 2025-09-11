package com.ssafy.keeping.domain.group.contoller;

import com.ssafy.keeping.domain.group.dto.GroupRequestDto;
import com.ssafy.keeping.domain.group.dto.GroupResponseDto;
import com.ssafy.keeping.domain.group.service.GroupService;
import com.ssafy.keeping.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
