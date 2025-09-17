package com.ssafy.keeping.domain.otp.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class OtpRequestResponse {

    @NotBlank
    private String regSessionId;

    private String otpNumber;
}
