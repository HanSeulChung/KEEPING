package com.ssafy.keeping.domain.customer.dto;

import com.ssafy.keeping.domain.customer.model.Customer;
import com.ssafy.keeping.domain.customer.model.Gender;
import com.ssafy.keeping.domain.customer.model.ProviderType;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Builder
public class CustomerRegisterResponse {
    private Long customerId;
    private String providerId;
    private ProviderType providerType;
    private String name;
    private String email;
    private String phoneNumber;
    private LocalDate birth;
    private Gender gender;
    private String imgUrl;
    private LocalDateTime phoneVerifiedAt;

    public static CustomerRegisterResponse register(Customer customer) {
        return CustomerRegisterResponse.builder()
                .customerId(customer.getCustomerId())
                .providerId(customer.getProviderId())
                .providerType(customer.getProviderType())
                .phoneNumber(customer.getPhoneNumber())
                .name(customer.getName())
                .email(customer.getEmail())
                .gender(customer.getGender())
                .birth(customer.getBirth())
                .imgUrl(customer.getImgUrl())
                .phoneVerifiedAt(customer.getPhoneVerifiedAt())
                .build();
    }
}
