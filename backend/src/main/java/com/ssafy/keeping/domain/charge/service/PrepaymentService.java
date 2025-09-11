package com.ssafy.keeping.domain.charge.service;

import com.ssafy.keeping.domain.charge.dto.request.PrepaymentRequestDto;
import com.ssafy.keeping.domain.charge.dto.response.PrepaymentResponseDto;
import com.ssafy.keeping.domain.charge.dto.response.PrepaymentResponseDto.PrepaymentData;
import com.ssafy.keeping.domain.charge.dto.ssafyapi.response.SsafyCardPaymentResponseDto;
import com.ssafy.keeping.domain.charge.entity.*;
import com.ssafy.keeping.domain.charge.repository.*;
import com.ssafy.keeping.global.exception.CustomException;
import com.ssafy.keeping.global.exception.constants.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PrepaymentService {

    private final SsafyFinanceApiService ssafyFinanceApiService;
    private final CustomerRepository customerRepository;
    private final StoreRepository storeRepository;
    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final WalletStoreLotRepository walletStoreLotRepository;
    private final WalletStoreBalanceRepository walletStoreBalanceRepository;
    private final SettlementTaskRepository settlementTaskRepository;

    /**
     * 선결제 처리
     */
    public PrepaymentResponseDto processPayment(Long storeId, PrepaymentRequestDto requestDto) {
        // 1. 사용자 정보 조회 및 검증
        Customer customer = customerRepository.findById(requestDto.getUserId())
                .orElseThrow(() -> new CustomException(ErrorCode.CUSTOMER_NOT_FOUND));

        String userKey = customer.getUserKey();

        if (userKey == null || userKey.trim().isEmpty()) {
            throw new CustomException(ErrorCode.USER_KEY_NOT_FOUND);
        }

        // 2. 가게 정보 조회 및 검증
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new CustomException(ErrorCode.STORE_NOT_FOUND));

        String merchantId = String.valueOf(store.getMerchantId());

        // 3. 사용자의 개인 지갑 조회 또는 생성
        Wallet wallet = findOrCreateIndividualWallet(customer);

        // 4. 외부 API 호출 (카드 결제) - CustomException이 자동으로 던져짐
        SsafyCardPaymentResponseDto apiResponse = ssafyFinanceApiService.requestCardPayment(
                userKey,
                requestDto.getCardNo(),
                requestDto.getCvc(),
                merchantId,
                requestDto.getPaymentBalance()
        );

        // 5. DB 업데이트 (트랜잭션 처리)
        return updateDatabaseAfterPayment(wallet, store, requestDto.getPaymentBalance(), apiResponse);
    }

    /**
     * 개인 지갑 조회 또는 생성
     */
    private Wallet findOrCreateIndividualWallet(Customer customer) {
        return walletRepository.findByCustomerAndWalletType(customer, Wallet.WalletType.INDIVIDUAL)
                .orElseGet(() -> {
                    Wallet newWallet = Wallet.builder()
                            .customer(customer)
                            .walletType(Wallet.WalletType.INDIVIDUAL)
                            .build();
                    return walletRepository.save(newWallet);
                });
    }

    /**
     * 결제 성공 후 DB 업데이트
     */
    private PrepaymentResponseDto updateDatabaseAfterPayment(
            Wallet wallet, 
            Store store, 
            BigDecimal paymentAmount, 
            SsafyCardPaymentResponseDto apiResponse) {

        // 1. Transaction 생성
        Transaction transaction = Transaction.builder()
                .wallet(wallet)
                .customer(wallet.getCustomer())
                .store(store)
                .transactionType(Transaction.TransactionType.CHARGE)
                .amount(paymentAmount)
                .build();
        transaction = transactionRepository.save(transaction);

        // 2. WalletStoreLot 생성 (만료일: 1년 후)
        LocalDateTime expiredAt = LocalDateTime.now().plusYears(1);
        WalletStoreLot lot = WalletStoreLot.builder()
                .wallet(wallet)
                .store(store)
                .amountTotal(paymentAmount)
                .amountRemaining(paymentAmount)
                .acquiredAt(LocalDateTime.now())
                .expiredAt(expiredAt)
                .sourceType(WalletStoreLot.SourceType.CHARGE)
                .originChargeTransaction(transaction)
                .build();
        walletStoreLotRepository.save(lot);

        // 3. WalletStoreBalance 업데이트 또는 생성
        WalletStoreBalance balance = walletStoreBalanceRepository
                .findByWalletAndStore(wallet, store)
                .orElseGet(() -> WalletStoreBalance.builder()
                        .wallet(wallet)
                        .store(store)
                        .balance(BigDecimal.ZERO)
                        .build());

        balance.addBalance(paymentAmount);
        walletStoreBalanceRepository.save(balance);

        // 4. SettlementTask 생성 (후에 정산 예정)
        SettlementTask settlementTask = SettlementTask.builder()
                .transaction(transaction)
                .status(SettlementTask.Status.PENDING)
                .build();
        settlementTaskRepository.save(settlementTask);

        // 5. 응답 생성
        BigDecimal updatedBalance = balance.getBalance();
        
        PrepaymentData responseData = PrepaymentData.builder()
                .transactionId(transaction.getTransactionId())
                .transactionUniqueNo(apiResponse.getRec().getTransactionUniqueNo())
                .storeId(store.getStoreId())
                .storeName(store.getStoreName())
                .paymentAmount(paymentAmount)
                .transactionTime(transaction.getCreatedAt())
                .remainingBalance(updatedBalance)
                .build();

        return PrepaymentResponseDto.success(responseData);
    }
}