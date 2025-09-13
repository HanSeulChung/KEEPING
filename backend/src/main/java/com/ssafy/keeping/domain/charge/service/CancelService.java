package com.ssafy.keeping.domain.charge.service;

import com.ssafy.keeping.domain.charge.dto.response.CancelListResponseDto;
import com.ssafy.keeping.domain.charge.model.SettlementTask;
import com.ssafy.keeping.domain.charge.repository.SettlementTaskRepository;
import com.ssafy.keeping.domain.core.customer.model.Customer;
import com.ssafy.keeping.domain.core.customer.repository.CustomerRepository;
import com.ssafy.keeping.global.exception.CustomException;
import com.ssafy.keeping.global.exception.constants.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class CancelService {

    private final SettlementTaskRepository settlementTaskRepository;
    private final CustomerRepository customerRepository;

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