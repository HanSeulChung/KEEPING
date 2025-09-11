package com.ssafy.keeping.domain.otp.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.keeping.domain.customer.repository.CustomerRepository;
import com.ssafy.keeping.domain.otp.dto.OtpRequestDto;
import com.ssafy.keeping.domain.otp.dto.OtpRequestResponseDto;
import com.ssafy.keeping.domain.otp.dto.OtpVerifyRequestDto;
import com.ssafy.keeping.domain.otp.dto.OtpVerifyResponseDto;
import com.ssafy.keeping.domain.otp.session.RegSession;
import com.ssafy.keeping.domain.otp.session.RegSessionStore;
import com.ssafy.keeping.domain.otp.sms.SmsSender;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class OtpService {

    private final StringRedisTemplate redis;
    private final ObjectMapper om;
    private final CustomerRepository customerRepository;
    private final RegSessionStore sessionStore;
    private final SmsSender smsSender;
    private final SecureRandom secureRandom = new SecureRandom();

    private static final Duration REG_TTL = Duration.ofMinutes(30);
    private static final Duration OTP_TTL = Duration.ofMinutes(5);
    private static final String OTP_CODE_KEY = "otp:code:";
    private static final String OTP_TRY_KEY = "otp:try:";
    private static final int OTP_MAX_TRIES = 5;

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
        String regSessionId = UUID.randomUUID().toString();
        RegSession session = RegSession.fromOtpRequest(dto, regSessionId);
        sessionStore.setSession(regSessionId, session, REG_TTL);

        // OTP 전송
        String otp = createNumberKey();

        redis.opsForValue().set(OTP_CODE_KEY + regSessionId, otp, OTP_TTL);
        redis.opsForValue().set(OTP_TRY_KEY + regSessionId, "0", OTP_TTL);

        String text = "[keeping] 본인인증 인증번호는 " + otp + " 입니다. 정확히 입력해주세요.";

        smsSender.send(dto.getPhoneNumber(), text);

        return new OtpRequestResponseDto(regSessionId);
    }

    // OTP 검증
    public OtpVerifyResponseDto verifyOtp(OtpVerifyRequestDto dto) {
        RegSession regSession = sessionStore.getSession(dto.getRegSessionId());

        // OTP 검증
        String keyCode = OTP_CODE_KEY + dto.getRegSessionId();
        String keyTry = OTP_TRY_KEY + dto.getRegSessionId();

        String savedCode = redis.opsForValue().get(keyCode);
        if(savedCode == null || savedCode.isBlank()) {
            throw new IllegalStateException("인증이 만료되어 인증에 실패했습니다.");
        }

        // 실패 횟수 확인
        String triesStr = redis.opsForValue().get(keyTry);
        int tries = (triesStr == null) ? 0 : Integer.parseInt(triesStr);
        if(tries >= OTP_MAX_TRIES) {
            redis.delete(keyCode);
            redis.delete(keyTry);
            throw new IllegalStateException("인증 시도 횟수를 초과했습니다. 잠시 후 다시 시도해주세요");
        }

        // 인증 만료
        Long remains = redis.getExpire(keyCode);
        if(remains == null || remains <= 0) {
            redis.opsForValue().set(keyTry, "0", OTP_TTL);
            throw new IllegalStateException("인증이 만료되었습니다. 다시 시도해주세요.");
        }

        // 코드 검증 오류
        if(!savedCode.equals(dto.getCode())) {
            redis.opsForValue().set(keyTry, String.valueOf(tries + 1), redis.getExpire(keyTry));
            throw new IllegalStateException("인증번호가 일치하지 않습니다.");
        }

        // 코드 검증 성공
        redis.delete(keyCode);
        redis.delete(keyTry);

        // 업데이트
        regSession.markVerifiedAt();
        sessionStore.setSession(dto.getRegSessionId(), regSession, sessionStore.remainingTtl(dto.getRegSessionId()));

        return new OtpVerifyResponseDto(true);
    }

    private String createNumberKey() {
        log.debug("createNumberKey > ... ");

        int numberKey = 100000 + secureRandom.nextInt(900000);
        log.debug("numberKey: {}", numberKey);

        return String.valueOf(numberKey);
    }
}
