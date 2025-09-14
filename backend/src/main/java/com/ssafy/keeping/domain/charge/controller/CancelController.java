package com.ssafy.keeping.domain.charge.controller;

import com.ssafy.keeping.domain.charge.dto.response.CancelListResponseDto;
import com.ssafy.keeping.domain.charge.service.CancelService;
import com.ssafy.keeping.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.constraints.Positive;

@RestController
@RequestMapping("/api/v1/customers")
@RequiredArgsConstructor
@Slf4j
@Validated
public class CancelController {

    private final CancelService cancelService;

    /**
     * 취소 가능한 거래 목록 조회 (페이지네이션)
     * 
     * @param customerId 고객 ID
     * @param pageable 페이지네이션 정보 (기본: page=0, size=10, sort=createdAt,desc)
     * @return 취소 가능한 거래 목록
     */
    @GetMapping("/{customerId}/cancel-list")
    public ResponseEntity<ApiResponse<Page<CancelListResponseDto>>> getCancelableTransactions(
            @PathVariable Long customerId,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        
        log.info("취소 가능한 거래 목록 조회 요청 - 고객ID: {}, 페이지: {}, 크기: {}", 
                customerId, pageable.getPageNumber(), pageable.getPageSize());

        Page<CancelListResponseDto> cancelableTransactions = cancelService
                .getCancelableTransactions(customerId, pageable);
        
        log.info("취소 가능한 거래 목록 조회 완료 - 전체 요소 수: {}, 현재 페이지 요소 수: {}", 
                cancelableTransactions.getTotalElements(), cancelableTransactions.getNumberOfElements());

        return ResponseEntity.ok(
                ApiResponse.success(
                    "취소 가능한 거래 목록 조회가 완료되었습니다.", 
                    HttpStatus.OK.value(), 
                    cancelableTransactions
                )
        );
    }
}