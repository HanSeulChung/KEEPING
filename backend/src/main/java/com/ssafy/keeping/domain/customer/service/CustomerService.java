package com.ssafy.keeping.domain.customer.service;

import com.ssafy.keeping.domain.customer.dto.CustomerRegisterRequestDto;
import com.ssafy.keeping.domain.customer.dto.CustomerRegisterResponseDto;
import com.ssafy.keeping.domain.customer.dto.PrefillResponseDto;
import com.ssafy.keeping.domain.otp.session.RegSession;
import com.ssafy.keeping.domain.otp.session.RegSessionStore;
import com.ssafy.keeping.domain.otp.session.RegStep;
import com.ssafy.keeping.domain.customer.model.Customer;
import com.ssafy.keeping.domain.customer.repository.CustomerRepository;
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

    // 고객 등록
    @Transactional
    public CustomerRegisterResponseDto RegisterCustomer(CustomerRegisterRequestDto dto) {
        RegSession session = sessionStore.getSession(dto.getRegSessionId());
        if(session.getRegStep() != RegStep.PHONE_VERIFIED) {
            throw new IllegalStateException("휴대폰 인증이 필요합니다.");
        }

        // userKey
        String userKey = apiClient.searchUserKey(dto.getEmail()).getUserKey();

        // 고객 생성
        Customer customer = Customer.builder()
                .providerId(session.getProviderId())
                .providerType(session.getProviderType())
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

        return CustomerRegisterResponseDto.register(customer);
    }

    public PrefillResponseDto prefillInfo(String regSessionId) {
        RegSession session = sessionStore.getSession(regSessionId);

        return new PrefillResponseDto(session.getName(), session.getBirth(), session.getPhoneNumber());
    }

}
