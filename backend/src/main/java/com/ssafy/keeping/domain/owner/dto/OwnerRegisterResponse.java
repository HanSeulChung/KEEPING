package com.ssafy.keeping.domain.owner.dto;

import com.ssafy.keeping.domain.auth.enums.AuthProvider;
import com.ssafy.keeping.domain.auth.enums.Gender;
import com.ssafy.keeping.domain.core.owner.model.Owner;
import com.ssafy.keeping.domain.customer.dto.CustomerRegisterResponse;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Builder
public class OwnerRegisterResponse {
    private Long ownerId;
    private String providerId;
    private AuthProvider providerType;
    private String name;
    private String email;
    private String phoneNumber;
    private LocalDate birth;
    private Gender gender;
    private String imgUrl;
    private LocalDateTime phoneVerifiedAt;

    public static OwnerRegisterResponse register(Owner owner) {
        return OwnerRegisterResponse.builder()
                .ownerId(owner.getOwnerId())
                .providerId(owner.getProviderId())
                .providerType(owner.getProviderType())
                .phoneNumber(owner.getPhoneNumber())
                .name(owner.getName())
                .email(owner.getEmail())
                .gender(owner.getGender())
                .birth(owner.getBirth())
                .imgUrl(owner.getImgUrl())
                .phoneVerifiedAt(owner.getPhoneVerifiedAt())
                .build();
    }
}
