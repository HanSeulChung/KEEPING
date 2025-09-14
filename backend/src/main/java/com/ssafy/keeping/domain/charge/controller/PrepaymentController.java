package com.ssafy.keeping.domain.charge.controller;

import com.ssafy.keeping.domain.charge.dto.request.PrepaymentRequestDto;
import com.ssafy.keeping.domain.charge.dto.response.PrepaymentResponseDto;
import com.ssafy.keeping.domain.charge.service.PrepaymentService;
import com.ssafy.keeping.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;

@RestController
@RequestMapping("/api/v1/stores")
@RequiredArgsConstructor
@Slf4j
@Validated
public class PrepaymentController {

    private final PrepaymentService prepaymentService;

    /**
     * 선결제 처리
     * 
     * @param storeId 가게 ID
     * @param requestDto 선결제 요청 정보
     * @return 선결제 처리 결과
     */
    @PostMapping("/{storeId}/prepayment")
    public ResponseEntity<ApiResponse<PrepaymentResponseDto>> processPrePayment(
            @PathVariable @Positive(message = "가게 ID는 양수여야 합니다.") Long storeId,
            @RequestBody @Valid PrepaymentRequestDto requestDto) {
        
        log.info("선결제 요청 수신 - 가게ID: {}, 사용자ID: {}, 금액: {}", 
                storeId, requestDto.getUserId(), requestDto.getPaymentBalance());

        PrepaymentResponseDto responseDto = prepaymentService.processPayment(storeId, requestDto);
        
        log.info("선결제 처리 성공 - 거래ID: {}", responseDto.getTransactionId());
        return ResponseEntity.ok(ApiResponse.success("선결제가 성공적으로 완료되었습니다.", HttpStatus.OK.value(), responseDto));
    }

}