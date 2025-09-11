package com.ssafy.keeping.domain.otp.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class OtpRequestResponseDto {

    @NotBlank
    private String regSessionId;
}
