package com.ssafy.keeping.domain.user.owner.dto;

import com.ssafy.keeping.domain.auth.service.TokenResponse;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SignupOwnerResponse {
    private final OwnerRegisterResponse user;
    private final TokenResponse token;
}

