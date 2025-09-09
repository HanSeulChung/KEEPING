package com.ssafy.keeping.domain.otp.dto;

import jakarta.validation.constraints.NotBlank;

public class OtpRequestResponseDto {

    @NotBlank
    private String regSessionId;
}
