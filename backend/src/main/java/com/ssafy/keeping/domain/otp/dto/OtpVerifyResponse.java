package com.ssafy.keeping.domain.otp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class OtpVerifyResponse {

    private boolean verified;
}
