package com.ssafy.keeping.domain.otp.controller;

import com.ssafy.keeping.domain.otp.dto.OtpRequestDto;
import com.ssafy.keeping.domain.otp.dto.OtpRequestResponseDto;
import com.ssafy.keeping.domain.otp.dto.OtpVerifyRequestDto;
import com.ssafy.keeping.domain.otp.dto.OtpVerifyResponseDto;
import com.ssafy.keeping.domain.otp.service.OtpService;
import com.ssafy.keeping.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.SecureRandom;

@RestController
@RequestMapping("/otp")
@RequiredArgsConstructor
public class OtpController {

    private final OtpService otpService;
    private final SecureRandom secureRandom;


    // otp 요청
    @PostMapping("/request")
    public ResponseEntity<ApiResponse<OtpRequestResponseDto>> request(@RequestBody OtpRequestDto dto) {
        OtpRequestResponseDto responseDto = otpService.requestDto(dto);

        return ResponseEntity.ok(ApiResponse.success("OTP가 정상적으로 전송되었습니다", HttpStatus.OK, responseDto));
    }

    // otp 검증
    @PostMapping("/verify")
    public ResponseEntity<ApiResponse<OtpVerifyResponseDto>> verify(@RequestBody OtpVerifyRequestDto dto) {
        OtpVerifyResponseDto responseDto = otpService.verifyOtp(dto);
        return ResponseEntity.ok(ApiResponse.success("OTP를 검증합니다.", HttpStatus.OK, responseDto));
    }


}
