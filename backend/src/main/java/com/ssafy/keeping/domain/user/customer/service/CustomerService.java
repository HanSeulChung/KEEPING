package com.ssafy.keeping.domain.user.customer.service;

import com.ssafy.keeping.domain.user.customer.model.Customer;
import com.ssafy.keeping.domain.user.customer.repository.CustomerRepository;
import com.ssafy.keeping.domain.user.customer.dto.CustomerRegisterRequest;
import com.ssafy.keeping.domain.user.customer.dto.CustomerRegisterResponse;
import com.ssafy.keeping.domain.otp.session.RegSession;
import com.ssafy.keeping.domain.otp.session.RegSessionStore;
import com.ssafy.keeping.domain.otp.session.RegStep;
import com.ssafy.keeping.global.client.FinOpenApiClient;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
@Slf4j
public class CustomerService {

    private final CustomerRepository customerRepository;
//    private final PasswordEncoder pinEncoder;
    private final RegSessionStore sessionStore;
    private final FinOpenApiClient apiClient;

    private static final String SIGN_UP_INFO_KEY = "signup:info:";

    // 고객 등록
    @Transactional
    public CustomerRegisterResponse RegisterCustomer(CustomerRegisterRequest dto) {
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
        Customer customer = Customer.builder()
                .providerType(session.getProvider())
                .providerId(session.getProviderId())
                .name(session.getName())
                .email(session.getEmail())
                .gender(session.getGender())
                .birth(session.getBirth())
                .imgUrl(session.getImgUrl())
                .phoneNumber(session.getPhoneNumber())
                .userKey(userKey)
                .build();

        try {
            customer = customerRepository.save(customer);
        } catch (DataIntegrityViolationException e){
            // TODO: 예외처리
            throw e;
        }

        // TODO: 결제 비밀번호 저장
        // pinService.save(dto.getPaymentPin());

        // 세션 만료
        sessionStore.deleteSession(SIGN_UP_INFO_KEY, dto.getRegSessionId());
        return CustomerRegisterResponse.register(customer);
    }

}
