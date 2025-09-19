package com.ssafy.keeping.domain.user.customer.service;

import com.ssafy.keeping.domain.auth.pin.service.PinAuthService;
import com.ssafy.keeping.domain.user.customer.model.Customer;
import com.ssafy.keeping.domain.user.customer.repository.CustomerRepository;
import com.ssafy.keeping.domain.user.customer.dto.CustomerRegisterRequest;
import com.ssafy.keeping.domain.user.customer.dto.CustomerRegisterResponse;
import com.ssafy.keeping.domain.otp.session.RegSession;
import com.ssafy.keeping.domain.otp.session.RegSessionStore;
import com.ssafy.keeping.domain.otp.session.RegStep;
import com.ssafy.keeping.domain.user.dto.ProfileUploadResponse;
import com.ssafy.keeping.domain.user.finopenapi.dto.*;
import com.ssafy.keeping.global.s3.service.ImageService;
import com.ssafy.keeping.domain.wallet.constant.WalletType;
import com.ssafy.keeping.domain.wallet.model.Wallet;
import com.ssafy.keeping.domain.wallet.repository.WalletRepository;
import com.ssafy.keeping.global.client.FinOpenApiClient;
import com.ssafy.keeping.global.exception.CustomException;
import com.ssafy.keeping.global.exception.constants.ErrorCode;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;


@Service
@RequiredArgsConstructor
@Slf4j
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final RegSessionStore sessionStore;
    private final FinOpenApiClient apiClient;
    private final PinAuthService pinAuthService;
    private final WalletRepository walletRepository;
    private final ImageService imageService;

    private static final String SIGN_UP_INFO_KEY = "signup:info:";

    // 고객 등록
    @Transactional
    public CustomerRegisterResponse RegisterCustomer(CustomerRegisterRequest dto) {
        RegSession session = sessionStore.getSession(SIGN_UP_INFO_KEY, dto.getRegSessionId());
        if(session.getRegStep() != RegStep.PHONE_VERIFIED) {
            throw new IllegalStateException("휴대폰 인증이 필요합니다.");
        }

        // userKey 생성
        String userKey;

        try {
            SearchUserKeyResponseDto searchUserKeyResponse = apiClient.searchUserKey(session.getEmail());

            // userKey 있으면
            if(searchUserKeyResponse != null
                    && searchUserKeyResponse.getUserKey() != null
                    && !searchUserKeyResponse.getUserKey().isEmpty()) {

                userKey = searchUserKeyResponse.getUserKey();
                log.debug("기존 userKey 사용");

            } else {
                // userKey 생성 (catch 문으로 이동)
                log.debug("새로운 userKey 생성");
                throw new CustomException(ErrorCode.USER_KEY_NOT_FOUND);
            }

        } catch (Exception e) {
            // userKey 생성
            try {
                log.debug("FinOpenApi userkey 생성 : {}", session.getEmail());
                InsertMemberResponseDto member = apiClient.insertMember(session.getEmail());
                userKey = member.getUserKey();
                log.debug("userKey 생성 완료");

            } catch (CustomException ex) {
                // 생성 실패
                log.warn("FinOpenApi Member 생성 실패 : {}", session.getEmail());
                throw new CustomException(ErrorCode.BAD_REQUEST);
            }
        }

        // userKey 가 null 이거나 empty
        if(userKey == null || userKey.isEmpty()) {
            log.error("userKey 얻을 수 없음 : {}", session.getEmail());
            throw new CustomException(ErrorCode.BAD_REQUEST);
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

        // 결제 비밀번호 저장
        pinAuthService.setOrUpdatePin(customer.getCustomerId(), dto.getPaymentPin());

        // 계좌 생성
        String accountNo = null;

        try{
            log.debug("계좌 생성 시도");
            String role = "CUSTOMER";
            CreateAccountResponse accountResponse = apiClient.createAccount(userKey, role);
            accountNo = accountResponse.getRecResponse().getAccountNo();
            log.debug("계좌 생성 성공");

        } catch (CustomException e) {
            log.debug("해당 계좌 생성 실패 : {}", accountNo);

            throw e;
        }

        // 카드 생성
        try{
            log.debug("해당 계좌로 카드 생성 : {}", accountNo);
            apiClient.issueCard(userKey, accountNo);
            log.debug("카드 생성 성공");
        } catch (CustomException e) {
            log.debug("해당 계좌로 카드 생성 실패 : {}", accountNo);
            throw e;
        }

        // 계좌 입금 (1억)
        try {
            log.debug("해당 계좌로 입금 : {}", accountNo);
            apiClient.accountDeposit(userKey, accountNo);
            log.debug("입금 성공");

        } catch (CustomException e) {
            log.debug("해당 계좌로 입금 실패 : {}", accountNo);
            throw e;
        }

        // 지갑 생성
        Wallet wallet = Wallet.builder().customer(customer).walletType(WalletType.INDIVIDUAL).build();

        try {
            walletRepository.save(wallet);
        } catch (CustomException e) {
            throw new CustomException(ErrorCode.USER_NOT_FOUND);
        }

        // 세션 만료
        sessionStore.deleteSession(SIGN_UP_INFO_KEY, dto.getRegSessionId());
        return CustomerRegisterResponse.register(customer);
    }

    public Customer validCustomer(Long customerId) {
        return customerRepository.findByCustomerIdAndDeletedAtIsNull(customerId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
    }

    // 프로필 이미지 변경
    @Transactional
    public ProfileUploadResponse uploadProfileImage(Long customerId, MultipartFile newImage) {
        String oldImgUrl = customerRepository.findImageUrlByCustomerId(customerId)
                .orElseThrow(() -> new CustomException(ErrorCode.BAD_REQUEST));

        // 변경
        try {
            String newImgUrl = imageService.updateProfileImage(oldImgUrl, newImage);
            customerRepository.updateImageUrl(customerId, newImgUrl);

            log.info("사용자 {} 프로필 이미지 업데이트: {}", customerId, newImgUrl);
            return ProfileUploadResponse.builder()
                    .newImgUrl(newImgUrl)
                    .build();

        } catch (IOException e) {
            throw new CustomException(ErrorCode.BAD_REQUEST);
        }
    }

}
