package com.ssafy.keeping.domain.auth.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.keeping.domain.auth.Util.CookieUtil;
import com.ssafy.keeping.domain.auth.enums.UserRole;
import com.ssafy.keeping.domain.core.customer.model.Customer;
import com.ssafy.keeping.domain.core.customer.repository.CustomerRepository;
import com.ssafy.keeping.domain.core.owner.model.Owner;
import com.ssafy.keeping.domain.core.owner.repository.OwnerRepository;
import com.ssafy.keeping.domain.customer.dto.CustomerRegisterResponse;
import com.ssafy.keeping.domain.customer.dto.PrefillResponse;
import com.ssafy.keeping.domain.customer.dto.SignupCustomerResponse;
import com.ssafy.keeping.domain.otp.session.RegSession;
import com.ssafy.keeping.domain.otp.session.RegSessionStore;
import com.ssafy.keeping.domain.otp.session.RegStep;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final StringRedisTemplate redis;
    private final ObjectMapper om;
    private final CustomerRepository customerRepository;
    private final OwnerRepository ownerRepository;
    private final RegSessionStore sessionStore;
    private final TokenService tokenService;
    private final CookieUtil cookieUtil;

    private final String SIGN_UP_INFO_KEY = "signup:info:";
    private final String OTP_KEY_PREFIX = "otp:info:";

    public UserRole extractRoleFromState(HttpServletRequest request) {
        // 세션에서 role 가져오기
        String role = (String) request.getSession().getAttribute("oauth_role");
        System.out.println("[AUTH SERVICE] Session ID: " + request.getSession().getId());
        System.out.println("[AUTH SERVICE] Found role in session: " + role);

        if (role != null) {
            request.getSession().removeAttribute("oauth_role"); // 한 번 사용 후 삭제
            return toUserRole(role);
        }

        System.out.println("[AUTH SERVICE] No role found in session, returning null");
        return null;
    }

    public UserRole toUserRole(String role) {
        return UserRole.valueOf(role.toUpperCase());
    }


    public boolean userExists(UserRole role, String providerId, String provider) {
        // role이 null인 경우 체크
        if (role == null) {
            throw new IllegalArgumentException("Role cannot be null");
        }
        
        Customer.ProviderType providerType = toProviderType(provider);

        return switch (role) {
            case CUSTOMER -> customerExists(providerType, providerId);
            case OWNER -> ownerExists(providerType,providerId);
            default -> throw new IllegalStateException("유저를 찾을 수 없습니다.");
        };
    }

    // userId 꺼내기
    public Long getUserId(String providerId, String provider, UserRole userRole) {
        Customer.ProviderType providerType = toProviderType(provider);

        return switch (userRole) {
            case CUSTOMER -> customerRepository.findByProviderTypeAndProviderIdAndDeletedAtIsNull(providerType, providerId)
                    .map(Customer::getCustomerId).orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
            case OWNER ->  ownerRepository.findByProviderTypeAndProviderIdAndDeletedAtIsNull(providerType, providerId)
                    .map(Owner::getOwnerId).orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
            default -> throw new IllegalStateException("유저를 찾을 수 없습니다");
        };
    }

    // 회원가입용 정보 redis 에 저장
    public void storeSingUpInfo(String regSessionId, String providerId, String provider, String email, String imgUrl, UserRole role) {
        Map<String, Object> socialSignUpInfo = new HashMap<>();
        socialSignUpInfo.put("providerId", providerId);
        socialSignUpInfo.put("provider", provider.toUpperCase());
        socialSignUpInfo.put("UserRole", role == null ? null : role.name());
        socialSignUpInfo.put("email", email);
        socialSignUpInfo.put("imgUrl", imgUrl);

        String key = SIGN_UP_INFO_KEY + regSessionId;

        try {
            String info = om.writeValueAsString(socialSignUpInfo);
            redis.opsForValue().set(key, info, Duration.ofMinutes(15));
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to serialize signUpInfo", e);
        }
    }

    // otp 입력 후 합치기
    public void attachOtpInfo(String regSessionId) {
        String otpKey = OTP_KEY_PREFIX + regSessionId;
        String otpValue = redis.opsForValue().get(otpKey);

        System.out.println("[ATTACH OTP] otpKey: " + otpKey);
        System.out.println("[ATTACH OTP] otpValue: " + otpValue);

        RegSession regSession = new RegSession();
        if(otpValue != null) {
            try {
                regSession = om.readValue(otpValue, RegSession.class);
                System.out.println("[ATTACH OTP] regSession name: " + regSession.getName());
                System.out.println("[ATTACH OTP] regSession birth: " + regSession.getBirth());
                System.out.println("[ATTACH OTP] regSession phone: " + regSession.getPhoneNumber());
                System.out.println("[ATTACH OTP] regSession regStep: " + regSession.getRegStep());
            } catch (JsonProcessingException e) {
                throw new RuntimeException(e);
            }
        } else {
            System.out.println("[ATTACH OTP] otpValue is null!");
        }

        String signUpKey = SIGN_UP_INFO_KEY + regSessionId;
        String signUpValue = redis.opsForValue().get(signUpKey);

        System.out.println("[ATTACH OTP] signUpKey: " + signUpKey);
        System.out.println("[ATTACH OTP] signUpValue before: " + signUpValue);

        Map<String, Object> map = new HashMap<>();

        if(signUpValue != null) {
            try {
                map = om.readValue(signUpValue, Map.class);
            } catch (JsonProcessingException e) {
                throw new RuntimeException(e); // 수정 필요
            }
        }

        map.put("name", regSession.getName());
        map.put("birth", regSession.getBirth());
        map.put("phoneNumber", regSession.getPhoneNumber());
        map.put("regStep", RegStep.PHONE_VERIFIED);
        map.put("phoneVerfiedAt", regSession.getPhoneVerifiedAt());

        try {
            String finalValue = om.writeValueAsString(map);
            System.out.println("[ATTACH OTP] signUpValue after: " + finalValue);
            redis.opsForValue().set(signUpKey, finalValue, Duration.ofMinutes(15));
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

    public PrefillResponse prefillInfo(String regSessionId) {
        RegSession session = sessionStore.getSession(SIGN_UP_INFO_KEY, regSessionId);

        return new PrefillResponse(session.getName(), session.getBirth(), session.getPhoneNumber());
    }

    // 고객 회원가입
    public SignupCustomerResponse signUpTokenForCustomer(CustomerRegisterResponse customerResponse, HttpServletResponse response) {
        // 2) 토큰 발급
        TokenResponse token = tokenService.issueTokens(
                customerResponse.getCustomerId(),
                UserRole.CUSTOMER
        );

        // 3) 쿠키 세팅
        cookieUtil.addHttpOnlyRefreshCookie(response, token.getRefreshToken(), Duration.ofDays(7));

        return SignupCustomerResponse.builder().user(customerResponse).token(token.withoutRefreshToken()).build();

    }



    private boolean ownerExists(Customer.ProviderType providerType, String providerId) {
        return ownerRepository.findByProviderTypeAndProviderIdAndDeletedAtIsNull(providerType, providerId)
                .isPresent();
    }

    private boolean customerExists(Customer.ProviderType providerType, String providerId) {
        return customerRepository.findByProviderTypeAndProviderIdAndDeletedAtIsNull(providerType, providerId)
                .isPresent();
    }

    // ProviderType 으로 변경
    private Customer.ProviderType toProviderType(String provider) {
        return Customer.ProviderType.valueOf(provider.toUpperCase());
    }


}
