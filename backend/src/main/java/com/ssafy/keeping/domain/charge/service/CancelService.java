package com.ssafy.keeping.domain.charge.service;

import com.ssafy.keeping.domain.charge.dto.request.CancelRequestDto;
import com.ssafy.keeping.domain.charge.dto.response.CancelListResponseDto;
import com.ssafy.keeping.domain.charge.dto.response.CancelResponseDto;
import com.ssafy.keeping.domain.charge.model.SettlementTask;
import com.ssafy.keeping.domain.charge.repository.SettlementTaskRepository;
import com.ssafy.keeping.domain.core.customer.model.Customer;
import com.ssafy.keeping.domain.core.customer.repository.CustomerRepository;
import com.ssafy.keeping.domain.core.transaction.model.Transaction;
import com.ssafy.keeping.domain.core.transaction.repository.TransactionRepository;
import com.ssafy.keeping.global.exception.CustomException;
import com.ssafy.keeping.global.exception.constants.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class CancelService {

    private final SettlementTaskRepository settlementTaskRepository;
    private final CustomerRepository customerRepository;
    private final TransactionRepository transactionRepository;

    /**
     * 취소 가능한 거래 목록 조회 (페이지네이션)
     */
    public Page<CancelListResponseDto> getCancelableTransactions(Long customerId, Pageable pageable) {
        // 1. 고객 존재 여부 확인
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new CustomException(ErrorCode.CUSTOMER_NOT_FOUND));

        log.info("취소 가능한 거래 목록 조회 - 고객ID: {}, 페이지: {}, 크기: {}", 
                customerId, pageable.getPageNumber(), pageable.getPageSize());

        // 2. 취소 가능한 거래 조회
        Page<SettlementTask> cancelableTasks = settlementTaskRepository
                .findCancelableTransactions(customerId, pageable);

        // 3. DTO 변환
        return cancelableTasks.map(this::convertToDto);
    }

    /**
     * 카드 결제 취소 처리
     */
    @Transactional
    public CancelResponseDto cancelPayment(CancelRequestDto requestDto) {
        log.info("카드 결제 취소 처리 시작 - 거래번호: {}", requestDto.getTransactionUniqueNo());

        // 1. 취소 가능 검증
        Transaction originalTransaction = validateCancellation(requestDto.getTransactionUniqueNo());
        
        // 2. 외부 API 호출 (여기서 실제 취소 처리)
        // TODO: 5단계에서 구현 예정
        log.info("외부 API 취소 호출 예정 - 거래번호: {}", requestDto.getTransactionUniqueNo());
        
        // 3. DB 반영 (외부 API 성공 후)
        // TODO: 6단계에서 구현 예정
        log.info("DB 반영 로직 실행 예정");
        
        // 임시 응답 (실제 구현 후 수정 예정)
        return CancelResponseDto.builder()
                .cancelTransactionId(999L)
                .TransactionUniqueNo(requestDto.getTransactionUniqueNo())
                .cancelAmount(originalTransaction.getAmount())
                .cancelTime(LocalDateTime.now())
                .remainingBalance(originalTransaction.getAmount())
                .build();
    }

    /**
     * 취소 가능 검증
     */
    private Transaction validateCancellation(String transactionUniqueNo) {
        // 1. transactionUniqueNo로 원본 거래 조회
        Transaction originalTransaction = transactionRepository
                .findByTransactionUniqueNo(transactionUniqueNo)
                .orElseThrow(() -> new CustomException(ErrorCode.TRANSACTION_NOT_FOUND));

        // 2. settlement_task 상태 확인 (PENDING인지)
        SettlementTask settlementTask = settlementTaskRepository
                .findByTransaction(originalTransaction)
                .orElseThrow(() -> new CustomException(ErrorCode.SETTLEMENT_TASK_NOT_FOUND));

        if (!settlementTask.getStatus().equals(SettlementTask.Status.PENDING)) {
            throw new CustomException(ErrorCode.CANCEL_NOT_AVAILABLE);
        }

        log.info("취소 가능 검증 완료 - 거래ID: {}, 금액: {}", 
                originalTransaction.getTransactionId(), originalTransaction.getAmount());

        return originalTransaction;
    }

    /**
     * SettlementTask를 CancelListResponseDto로 변환
     */
    private CancelListResponseDto convertToDto(SettlementTask settlementTask) {
        return CancelListResponseDto.builder()
                .transactionUniqueNo(settlementTask.getTransaction().getTransactionUniqueNo())
                .storeName(settlementTask.getTransaction().getStore().getStoreName())
                .paymentAmount(settlementTask.getTransaction().getAmount())
                .transactionTime(settlementTask.getTransaction().getCreatedAt())
                .remainingBalance(settlementTask.getTransaction().getAmount()) // 미사용이므로 전액
                .build();
    }
}