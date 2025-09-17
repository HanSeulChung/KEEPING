package com.ssafy.keeping.domain.user.customer.dto;

import jakarta.validation.constraints.NotBlank;
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
