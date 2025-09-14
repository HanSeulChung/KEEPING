package com.ssafy.keeping.domain.otp.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDate;

@Data
@AllArgsConstructor
public class OtpRequest {

    @NotBlank
    private String regSessionId;

    @NotBlank
    private String name;

    @NotBlank
    @Pattern(regexp = "^[0-9]{10,11}$", message = "휴대폰 번호는 숫자로만 입력해야 합니다.")
    private String phoneNumber;

    @NotBlank
    private LocalDate birth;
}
