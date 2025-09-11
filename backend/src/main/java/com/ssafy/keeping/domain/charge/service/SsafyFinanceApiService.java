package com.ssafy.keeping.domain.charge.service;

import com.ssafy.keeping.domain.charge.dto.ssafyapi.request.SsafyApiHeaderDto;
import com.ssafy.keeping.domain.charge.dto.ssafyapi.request.SsafyCardPaymentRequestDto;
import com.ssafy.keeping.domain.charge.dto.ssafyapi.request.SsafyAccountDepositRequestDto;
import com.ssafy.keeping.domain.charge.dto.ssafyapi.response.SsafyCardPaymentResponseDto;
import com.ssafy.keeping.domain.charge.dto.ssafyapi.response.SsafyAccountDepositResponseDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.atomic.AtomicLong;

@Service
@RequiredArgsConstructor
@Slf4j
public class SsafyFinanceApiService {

    // RestTemplate : 외부 API 통신을 하기 위한 자료구조
    // GET, POST 등 다양한 방식의 HTTP 요청을 보내고, 그 응답을 받아오는 모든 과정을 담당
    private final RestTemplate restTemplate;
    
    @Value("${ssafy.finance.api.base-url:https://finopenapi.ssafy.io}")
    private String baseUrl;
    
    @Value("${ssafy.finance.api.key}")
    private String apiKey;
    
    // 기관거래고유번호 생성을 위한 카운터 (날짜+시간+6자리 일련번호)
    // AtomicLong은 멀티스레드 환경에서 안전하게 하기 위한 자료구조
    // '읽고-수정하고-쓰는' 과정을 **절대 중간에 끊기지 않는 하나의 동작(원자적 연산)**으로 보장
    private final AtomicLong transactionCounter = new AtomicLong(0);

    /**
     * 카드 결제 API 호출
     */
    public SsafyCardPaymentResponseDto requestCardPayment(
            String userKey,
            String cardNo,
            String cvc,
            String merchantId,
            BigDecimal paymentBalance) {
        
        try {
            // API 헤더 생성
            SsafyApiHeaderDto header = createCardPaymentHeader(userKey);
            
            // 요청 DTO 생성
            SsafyCardPaymentRequestDto requestDto = SsafyCardPaymentRequestDto.create(
                    header, cardNo, cvc, merchantId, paymentBalance);
            
            // HTTP 요청 생성
            HttpEntity<SsafyCardPaymentRequestDto> requestEntity = createHttpEntity(requestDto);
            
            // API 호출
            String url = baseUrl + "/ssafy/api/v1/edu/creditCard/createCreditCardTransaction";
            ResponseEntity<SsafyCardPaymentResponseDto> response = restTemplate.postForEntity(
                    url, requestEntity, SsafyCardPaymentResponseDto.class);
            
            SsafyCardPaymentResponseDto responseDto = response.getBody();
            
            if (responseDto != null && responseDto.isSuccess()) {
                log.info("카드 결제 성공 - 거래고유번호: {}", responseDto.getRec().getTransactionUniqueNo());
            } else {
                log.error("카드 결제 실패 - 응답: {}", responseDto);
            }
            
            return responseDto;
            
        } catch (Exception e) {
            log.error("카드 결제 API 호출 중 오류 발생", e);
            throw new RuntimeException("카드 결제 처리 중 오류가 발생했습니다.", e);
        }
    }

    /**
     * 카드 결제용 API 헤더 생성
     */
    private SsafyApiHeaderDto createCardPaymentHeader(String userKey) {
        LocalDateTime now = LocalDateTime.now();
        String transmissionDate = now.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String transmissionTime = now.format(DateTimeFormatter.ofPattern("HHmmss"));
        String institutionTransactionUniqueNo = generateInstitutionTransactionUniqueNo(now);
        
        return SsafyApiHeaderDto.createCardPaymentHeader(
                transmissionDate,
                transmissionTime,
                institutionTransactionUniqueNo,
                apiKey,
                userKey
        );
    }

    /**
     * 기관거래고유번호 생성 (YYYYMMDDHHMMSS + 6자리 일련번호)
     */
    private String generateInstitutionTransactionUniqueNo(LocalDateTime dateTime) {
        String dateTimeStr = dateTime.format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        long counter = transactionCounter.incrementAndGet() % 1000000; // 6자리로 제한
        return String.format("%s%06d", dateTimeStr, counter);
    }

    /**
     * 계좌 입금 API 호출 (정산용)
     */
    public SsafyAccountDepositResponseDto requestAccountDeposit(
            String userKey,
            String accountNo,
            BigDecimal transactionBalance,
            String transactionSummary) {
        
        try {
            // API 헤더 생성
            SsafyApiHeaderDto header = createAccountDepositHeader(userKey);
            
            // 요청 DTO 생성
            SsafyAccountDepositRequestDto requestDto = SsafyAccountDepositRequestDto.create(
                    header, accountNo, transactionBalance, transactionSummary);
            
            // HTTP 요청 생성
            HttpEntity<SsafyAccountDepositRequestDto> requestEntity = createHttpEntity(requestDto);
            
            // API 호출
            String url = baseUrl + "/ssafy/api/v1/edu/demandDeposit/updateDemandDepositAccountDeposit";
            ResponseEntity<SsafyAccountDepositResponseDto> response = restTemplate.postForEntity(
                    url, requestEntity, SsafyAccountDepositResponseDto.class);
            
            SsafyAccountDepositResponseDto responseDto = response.getBody();
            
            if (responseDto != null && responseDto.isSuccess()) {
                log.info("계좌 입금 성공 - 거래고유번호: {}, 계좌번호: {}, 금액: {}", 
                        responseDto.getRec().getTransactionUniqueNo(), accountNo, transactionBalance);
            } else {
                log.error("계좌 입금 실패 - 응답: {}", responseDto);
            }
            
            return responseDto;
            
        } catch (Exception e) {
            log.error("계좌 입금 API 호출 중 오류 발생", e);
            throw new RuntimeException("계좌 입금 처리 중 오류가 발생했습니다.", e);
        }
    }

    /**
     * 계좌 입금용 API 헤더 생성
     */
    private SsafyApiHeaderDto createAccountDepositHeader(String userKey) {
        LocalDateTime now = LocalDateTime.now();
        String transmissionDate = now.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String transmissionTime = now.format(DateTimeFormatter.ofPattern("HHmmss"));
        String institutionTransactionUniqueNo = generateInstitutionTransactionUniqueNo(now);
        
        return SsafyApiHeaderDto.createAccountDepositHeader(
                transmissionDate,
                transmissionTime,
                institutionTransactionUniqueNo,
                apiKey,
                userKey
        );
    }

    /**
     * HTTP 요청 엔터티 생성
     */
    private <T> HttpEntity<T> createHttpEntity(T requestDto) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        return new HttpEntity<>(requestDto, headers);
    }
}