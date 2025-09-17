package com.ssafy.keeping.domain.payment.intent.controller;

import com.ssafy.keeping.domain.idempotency.model.IdempotentResult;
import com.ssafy.keeping.domain.payment.intent.dto.ApproveRequest;
import com.ssafy.keeping.domain.payment.intent.dto.PaymentIntentDetailResponse;
import com.ssafy.keeping.domain.payment.intent.service.PaymentIntentService;
import com.ssafy.keeping.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
public class PaymentApprovalController {

    private final PaymentIntentService paymentIntentService;

    @Operation(summary = "결제 승인", description = "Idempotency-Key 필수, 승인은 고객 인증이 필요합니다.")
    @PostMapping("/{intentId}/approve")
    public ResponseEntity<ApiResponse<PaymentIntentDetailResponse>> approve(
            @PathVariable("intentId")UUID intentId,
            @RequestHeader("Idempotency-Key") String idemKey,
            @AuthenticationPrincipal(expression = "id") Long customerId,
            @Valid @RequestBody(required = true)ApproveRequest body
    ) {

        IdempotentResult<PaymentIntentDetailResponse> r =
                paymentIntentService.approve(intentId, idemKey, customerId, body);

        ResponseEntity.BodyBuilder builder = ResponseEntity.status(r.getHttpStatus());
        if (r.getRetryAfterSeconds() != null) {
            builder.header("Retry-After", String.valueOf(r.getRetryAfterSeconds()));
        }

        String msg = r.isReplay()
                ? "이전에 처리된 요청의 결과입니다."
                : (r.getHttpStatus().is2xxSuccessful()
                    ? "결제가 승인되었습니다."
                    : "요청 처리에 실패했습니다.");

        return builder.body(ApiResponse.success(msg, r.getHttpStatus().value(), r.getBody()));
    }
}