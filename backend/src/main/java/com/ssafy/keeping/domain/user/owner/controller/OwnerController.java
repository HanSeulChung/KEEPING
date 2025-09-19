package com.ssafy.keeping.domain.user.owner.controller;

import com.ssafy.keeping.domain.user.dto.ProfileUploadResponse;
import com.ssafy.keeping.domain.user.owner.service.OwnerService;
import com.ssafy.keeping.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/owners")
@RequiredArgsConstructor
public class OwnerController {

    private final OwnerService ownerService;

    // 프로필 이미지 수정
    @PostMapping("/{ownerId}/profile-image/upload")
    public ResponseEntity<ApiResponse<ProfileUploadResponse>> uploadProfileImage(@PathVariable Long ownerId,
                                                                                 @RequestParam("file") MultipartFile file) {
        ProfileUploadResponse response = ownerService.uploadProfileImage(ownerId, file);

        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success("성공적 변경", HttpStatus.OK.value(),response));

    }
}
