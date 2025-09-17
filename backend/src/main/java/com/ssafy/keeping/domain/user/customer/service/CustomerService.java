package com.ssafy.keeping.domain.user.customer.service;

import com.ssafy.keeping.domain.auth.pin.service.PinAuthService;
import com.ssafy.keeping.domain.user.customer.model.Customer;
import com.ssafy.keeping.domain.user.customer.repository.CustomerRepository;
import com.ssafy.keeping.domain.user.customer.dto.CustomerRegisterRequest;
import com.ssafy.keeping.domain.user.customer.dto.CustomerRegisterResponse;
import com.ssafy.keeping.domain.otp.session.RegSession;
import com.ssafy.keeping.domain.otp.session.RegSessionStore;
import com.ssafy.keeping.domain.otp.session.RegStep;
import com.ssafy.keeping.domain.user.finopenapi.dto.AccountDepositResponse;
import com.ssafy.keeping.domain.user.finopenapi.dto.CreateAccountResponse;
import com.ssafy.keeping.domain.user.finopenapi.dto.InsertMemberResponseDto;
import com.ssafy.keeping.domain.user.finopenapi.dto.IssueCardResponse;
import com.ssafy.keeping.global.client.FinOpenApiClient;
import com.ssafy.keeping.global.exception.CustomException;
import com.ssafy.keeping.global.exception.constants.ErrorCode;
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
    private final RegSessionStore sessionStore;
    private final FinOpenApiClient apiClient;
    private final PinAuthService pinAuthService;

    private static final String SIGN_UP_INFO_KEY = "signup:info:";

    // 고객 등록
    @Transactional
    public CustomerRegisterResponse RegisterCustomer(CustomerRegisterRequest dto) {
        RegSession session = sessionStore.getSession(SIGN_UP_INFO_KEY, dto.getRegSessionId());
        if(session.getRegStep() != RegStep.PHONE_VERIFIED) {
            throw new IllegalStateException("휴대폰 인증이 필요합니다.");
        }

        // userKey 생성
        String key = null;
        try {
            log.debug("FinOpenApi userkey 생성 : {}", session.getEmail());
            InsertMemberResponseDto member = apiClient.insertMember(session.getEmail());
            String userKey = member.getUserKey();
            key = userKey;
            log.debug("userKey 생성 : {}", userKey);
        } catch (CustomException e) {
            // 생성 실패
            log.warn("FinOpenApi Member 생성 실패 : {}", session.getEmail());
            throw new CustomException(ErrorCode.BAD_REQUEST);
        }

        // TODO : userKey 찾아서 있으면 패쓰
        try {
            String userKey = apiClient.searchUserKey(session.getEmail()).getUserKey();
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
                .userKey(key)
                .build();

        try {
            customer = customerRepository.save(customer);
        } catch (DataIntegrityViolationException e){
            // TODO: 예외처리
            throw e;
        }

        // 결제 비밀번호 저장
        pinAuthService.setOrUpdatePin(customer.getCustomerId(), dto.getPaymentPin());

        // 계좌 생성
        String accountNo = null;
        try{
            log.debug("계좌 생성 : {}", accountNo);
            CreateAccountResponse accountResponse = apiClient.createAccount(key);
            accountNo = accountResponse.getRecResponse().getAccountNo();
            log.debug("계좌 생성 성공");

        } catch (CustomException e) {
            log.debug("해당 계좌 생성 실패 : {}", accountNo);

            throw e;
        }

        // 카드 생성
        try{
            log.debug("해당 계좌로 카드 생성 : {}", accountNo);
            apiClient.issueCard(key, accountNo);
            log.debug("카드 생성 성공");
        } catch (CustomException e) {
            log.debug("해당 계좌로 카드 생성 실패 : {}", accountNo);
            throw e;
        }

        // 계좌 입금 (1억)
        try {
            log.debug("해당 계좌로 입금 : {}", accountNo);
            apiClient.accountDeposit(key, accountNo);
            log.debug("입금 성공");

        } catch (CustomException e) {
            log.debug("해당 계좌로 입금 실패 : {}", accountNo);
            throw e;
        }

        // 세션 만료
        sessionStore.deleteSession(SIGN_UP_INFO_KEY, dto.getRegSessionId());
        return CustomerRegisterResponse.register(customer);
    }



}
