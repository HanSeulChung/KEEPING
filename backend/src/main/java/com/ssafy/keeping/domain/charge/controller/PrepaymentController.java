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

        try {
            PrepaymentResponseDto responseDto = prepaymentService.processPayment(storeId, requestDto);
            
            if (responseDto.isSuccess()) {
                log.info("선결제 처리 성공 - 거래ID: {}", responseDto.getData().getTransactionId());
                return ResponseEntity.ok(ApiResponse.success("선결제가 성공적으로 완료되었습니다.", HttpStatus.OK, responseDto));
            } else {
                log.warn("선결제 처리 실패 - 사유: {}", responseDto.getMessage());
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error(responseDto.getMessage(), HttpStatus.BAD_REQUEST));
            }
            
        } catch (IllegalArgumentException e) {
            log.error("선결제 요청 검증 실패", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage(), HttpStatus.BAD_REQUEST));
                    
        } catch (Exception e) {
            log.error("선결제 처리 중 서버 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("선결제 처리 중 오류가 발생했습니다.", HttpStatus.INTERNAL_SERVER_ERROR));
        }
    }

}