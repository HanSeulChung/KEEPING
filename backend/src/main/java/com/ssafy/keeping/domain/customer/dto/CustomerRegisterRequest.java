package com.ssafy.keeping.domain.customer.dto;

import com.ssafy.keeping.domain.core.customer.model.Customer;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CustomerRegisterRequest {

    private String regSessionId;
//
//    @NotBlank
//    private String email;
//
    @NotNull
    private Customer.Gender gender;

//    @NotBlank
//    @com.fasterxml.jackson.annotation.JsonProperty(access = com.fasterxml.jackson.annotation.JsonProperty.Access.WRITE_ONLY)
//    private Long paymentPin;

//    @NotBlank
//    private String imgUrl;

    private String userKey;
}
