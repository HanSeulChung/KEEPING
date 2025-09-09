package com.ssafy.keeping.domain.customer.dto;

import com.ssafy.keeping.domain.customer.model.Customer;
import com.ssafy.keeping.domain.customer.model.Gender;
import com.ssafy.keeping.domain.customer.model.ProviderType;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Builder
@Getter
public class CustomerRegisterResponseDto {

    private String providerId;
    private ProviderType providerType;
    private String name;
    private String email;
    private String phoneNumber;
    private LocalDate birth;
    private Gender gender;
    private String imgUrl;

    public static CustomerRegisterResponseDto register(Customer customer) {
        return CustomerRegisterResponseDto.builder()
                .providerId(customer.getProviderId())
                .providerType(customer.getProviderType())
                .name(customer.getName())
                .email(customer.getEmail())
                .gender(customer.getGender())
                .birth(customer.getBirth())
                .imgUrl(customer.getImgUrl())
                .build();
    }
}
