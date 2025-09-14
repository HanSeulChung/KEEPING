package com.ssafy.keeping.domain.customer.service;

import com.ssafy.keeping.domain.core.customer.model.Customer;
import com.ssafy.keeping.domain.core.customer.repository.CustomerRepository;
import com.ssafy.keeping.domain.customer.dto.CustomerRegisterRequest;
import com.ssafy.keeping.domain.customer.dto.CustomerRegisterResponse;
import com.ssafy.keeping.domain.otp.session.RegSession;
import com.ssafy.keeping.domain.otp.session.RegSessionStore;
import com.ssafy.keeping.domain.otp.session.RegStep;
import com.ssafy.keeping.global.client.FinOpenApiClient;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
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
        String userKey = apiClient.searchUserKey(dto.getEmail()).getUserKey();

        // 고객 생성
        Customer customer = Customer.builder()
                .name(session.getName())
                .email(dto.getEmail())
                .gender(dto.getGender())
                .birth(session.getBirth())
                .phoneVerifiedAt(session.getPhoneVerifiedAt())
                .imgUrl(dto.getImgUrl())
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
