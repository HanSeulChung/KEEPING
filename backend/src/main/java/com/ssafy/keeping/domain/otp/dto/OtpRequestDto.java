package com.ssafy.keeping.domain.otp.dto;

import com.ssafy.keeping.domain.customer.model.ProviderType;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDate;

@Data
@AllArgsConstructor
public class OtpRequestDto {

    @NotBlank
    private String providerId;

    @NotBlank
    private ProviderType providerType;

    @NotBlank
    private String name;

    @NotBlank
    private String phoneNumber;

    @NotBlank
    private LocalDate birth;
}
