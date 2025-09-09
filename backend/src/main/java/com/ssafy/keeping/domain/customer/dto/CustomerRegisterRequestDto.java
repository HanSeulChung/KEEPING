package com.ssafy.keeping.domain.customer.dto;

import com.ssafy.keeping.domain.customer.model.Gender;
import com.ssafy.keeping.domain.customer.model.ProviderType;
import jakarta.annotation.Nullable;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDate;

@Data
@AllArgsConstructor
public class CustomerRegisterRequestDto {

    private String regSessionId;

    @NotBlank
    private String email;

    @NotBlank
    private Gender gender;

    @NotBlank
    @com.fasterxml.jackson.annotation.JsonProperty(access = com.fasterxml.jackson.annotation.JsonProperty.Access.WRITE_ONLY)
    private Long paymentPin;
}
