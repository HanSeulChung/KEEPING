package com.ssafy.keeping.domain.customer.dto;

import com.ssafy.keeping.domain.auth.enums.Gender;
import com.ssafy.keeping.domain.core.customer.model.Customer;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CustomerRegisterRequest {

    @NotBlank
    private String regSessionId;

//    @NotBlank
//    @com.fasterxml.jackson.annotation.JsonProperty(access = com.fasterxml.jackson.annotation.JsonProperty.Access.WRITE_ONLY)
//    private Long paymentPin;


    private String userKey;
}
