package com.ssafy.keeping.domain.owner.service;

import com.ssafy.keeping.domain.core.customer.model.Customer;
import com.ssafy.keeping.domain.core.customer.repository.CustomerRepository;
import com.ssafy.keeping.domain.core.owner.model.Owner;
import com.ssafy.keeping.domain.core.owner.repository.OwnerRepository;
import com.ssafy.keeping.domain.customer.dto.CustomerRegisterRequest;
import com.ssafy.keeping.domain.customer.dto.CustomerRegisterResponse;
import com.ssafy.keeping.domain.otp.session.RegSession;
import com.ssafy.keeping.domain.otp.session.RegSessionStore;
import com.ssafy.keeping.domain.otp.session.RegStep;
import com.ssafy.keeping.domain.owner.dto.OwnerRegisterRequest;
import com.ssafy.keeping.domain.owner.dto.OwnerRegisterResponse;
import com.ssafy.keeping.global.client.FinOpenApiClient;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
@Slf4j
public class OwnerService {

    private final OwnerRepository ownerRepository;
    private final RegSessionStore sessionStore;
    private final FinOpenApiClient apiClient;

    private static final String SIGN_UP_INFO_KEY = "signup:info:";

    // 고객 등록
    @Transactional
    public OwnerRegisterResponse RegisterOwner(OwnerRegisterRequest dto) {
        RegSession session = sessionStore.getSession(SIGN_UP_INFO_KEY, dto.getRegSessionId());
        if(session.getRegStep() != RegStep.PHONE_VERIFIED) {
            throw new IllegalStateException("휴대폰 인증이 필요합니다.");
        }

        // userKey
        String userKey = null;
        try {
            userKey = apiClient.searchUserKey(session.getEmail()).getUserKey();
        } catch (Exception e) {
            // 사용자를 찾을 수 없는 경우 null로 설정하고 계속 진행
            log.info("FinOpenAPI에서 사용자를 찾을 수 없음: {}", session.getEmail());
            userKey = null;
        }

        // 고객 생성
        Owner owner = Owner.builder()
                .providerType(session.getProvider())
                .providerId(session.getProviderId())
                .name(session.getName())
                .email(session.getEmail())
                .gender(dto.getGender())
                .birth(session.getBirth())
                .phoneVerifiedAt(session.getPhoneVerifiedAt())
                .imgUrl(session.getImgUrl())
                .phoneNumber(session.getPhoneNumber())
                .userKey(userKey)
                .build();

        try {
            owner = ownerRepository.save(owner);
        } catch (DataIntegrityViolationException e){
            // TODO: 예외처리
            throw e;
        }


        // 세션 만료
        sessionStore.deleteSession(SIGN_UP_INFO_KEY, dto.getRegSessionId());
        return OwnerRegisterResponse.register(owner);
    }

}
