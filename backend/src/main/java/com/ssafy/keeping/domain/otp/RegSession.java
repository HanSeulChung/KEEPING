package com.ssafy.keeping.domain.otp;

import com.ssafy.keeping.domain.otp.dto.OtpRequestDto;
import com.ssafy.keeping.domain.customer.model.ProviderType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegSession {
    private String regSessionId;
    private String providerId;
    private ProviderType providerType;
    private String name;
    private String phoneNumber;
    private LocalDate birth;
    private LocalDateTime phoneVerifiedAt;
    private RegStep regStep;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static RegSession fromOtpRequest(OtpRequestDto dto, String regSessionId) {
        return RegSession.builder()
                .regSessionId(regSessionId)
                .providerId(dto.getProviderId())
                .providerType(dto.getProviderType())
                .name(dto.getName())
                .phoneNumber(dto.getPhoneNumber())
                .birth(dto.getBirth())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .regStep(RegStep.OTP_SENT)
                .build();
    }

    public void markVerifiedAt() {
        this.phoneVerifiedAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.regStep = RegStep.PHONE_VERIFIED;
    }
}
