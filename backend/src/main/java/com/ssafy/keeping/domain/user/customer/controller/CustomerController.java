package com.ssafy.keeping.domain.user.customer.controller;

import com.ssafy.keeping.domain.group.repository.GroupMemberRepository;
import com.ssafy.keeping.domain.user.customer.dto.MyGroupsResponse;
import com.ssafy.keeping.domain.user.customer.service.CustomerService;
import com.ssafy.keeping.domain.user.dto.ProfileUploadResponse;
import com.ssafy.keeping.global.s3.service.ImageService;
import com.ssafy.keeping.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;
    private final GroupMemberRepository groupMemberRepository;
    private final ImageService imageService;


    // 프로필 이미지 수정
    @PostMapping(value = "/{customerId}/profile-image/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ProfileUploadResponse>> uploadProfileImage(@PathVariable Long customerId,
                                                                                 @RequestParam("file") MultipartFile file) {
        ProfileUploadResponse response = customerService.uploadProfileImage(customerId, file);

        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success("성공적 변경", HttpStatus.OK.value(), response));

    }

    @GetMapping("/me/groups")
    public ResponseEntity<ApiResponse<MyGroupsResponse>> myGroups(@AuthenticationPrincipal Long customerId) {

        List<Long> ids = groupMemberRepository.findGroupIdsByCustomerId(customerId);
        MyGroupsResponse data = MyGroupsResponse.of(ids);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("내가 속한 그룹을 조회하였습니다.", HttpStatus.CREATED.value(), data));
    }

    // 회원가입
//    @PostMapping("/")
//    public ResponseEntity<CustomerRegisterResponseDto> register(@RequestBody CustomerRegisterRequestDto dto) {
//        CustomerRegisterResponseDto responseDto = customerService.RegisterCustomer(dto);
//
//        return ResponseEntity.status(201).body(responseDto);
//    }



}
