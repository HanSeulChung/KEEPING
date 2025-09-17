package com.ssafy.keeping.domain.user.customer.dto;

import com.ssafy.keeping.domain.auth.service.TokenResponse;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SignupCustomerResponse {
    private final CustomerRegisterResponse user;
    private final TokenResponse token;
}

