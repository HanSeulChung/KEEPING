package com.ssafy.keeping.domain.customer.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.keeping.domain.otp.RegSession;
import com.ssafy.keeping.domain.otp.dto.OtpRequestDto;
import com.ssafy.keeping.domain.otp.dto.OtpRequestResponseDto;
import com.ssafy.keeping.domain.customer.model.Customer;
import com.ssafy.keeping.domain.customer.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final StringRedisTemplate redis;
    private final ObjectMapper om;
    private final PasswordEncoder pinEncoder;

    // 세션
    private static final String REG_KEY_PREFIX = "reg:session:";
    private static final Duration REG_TTL = Duration.ofMinutes(30);

    // OTP 요청
    public OtpRequestResponseDto requestDto(OtpRequestDto dto) {
        // 중복 가입 체크 (핸드폰 번호)
        if(customerRepository.existsByPhoneNumberAndDeletedAtIsNull(dto.getPhoneNumber())) {
            throw new IllegalStateException("이미 가입된 계정이 있습니다.");
        }

        // 탈퇴한 사용자라면, 7일 경과했는지 확인
        customerRepository.findByPhoneNumberAndDeletedAtIsNotNullOrderByDeletedAtDesc(dto.getPhoneNumber())
                .ifPresent(last -> {
                    if(LocalDateTime.now().isBefore(last.getDeletedAt().plusDays(7))) {
                        throw new IllegalStateException("탈퇴 후 7일이 지나야 재가입 가능합니다.");
                    }
                });

        // 세선 져장
        String sessionId = UUID.randomUUID().toString();
        RegSession session = RegSession.fromOtpRequest(dto, sessionId);

        return null;
    }

    // 고객 등록
    public void RegisterCustomer(Customer customer) {

    }
}
