package com.ssafy.keeping.domain.wallet.controller;

import com.ssafy.keeping.domain.idempotency.model.IdempotentResult;
import com.ssafy.keeping.domain.wallet.dto.PointShareRequestDto;
import com.ssafy.keeping.domain.wallet.dto.PointShareResponseDto;
import com.ssafy.keeping.domain.wallet.dto.WalletResponseDto;
import com.ssafy.keeping.domain.wallet.service.WalletServiceHS;
import com.ssafy.keeping.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/wallets")
@RequiredArgsConstructor
public class WalletController {
    private final WalletServiceHS walletService;

    @GetMapping("/groups/{groupId}")
    public ResponseEntity<ApiResponse<WalletResponseDto>> getGroupWallets(
            @AuthenticationPrincipal Long customerId,
            @PathVariable Long groupId
    ){
        WalletResponseDto dto = walletService.getGroupWallet(groupId, customerId);
        return ResponseEntity.ok(ApiResponse.success("모임 지갑 조회에 성공했습니다.", HttpStatus.OK.value(), dto));
    }
    // 모임 <-> 가게별 공유
    @PostMapping("/groups/{groupId}/stores/{storeId}")
    public ResponseEntity<ApiResponse<PointShareResponseDto>> createSharePoints(
            @AuthenticationPrincipal Long customerId,
            @PathVariable Long groupId,
            @PathVariable Long storeId,
            @RequestHeader("Idempotency-Key") String idemKey,
            @RequestBody @Valid PointShareRequestDto req
    ){
        IdempotentResult<PointShareResponseDto> result =
                walletService.sharePoints(groupId, customerId, storeId, idemKey, req);

        HttpStatus status = result.getHttpStatus();
        String msg;
        if (result.isReplay()) {
            msg = "이전에 처리된 포인트 공유 결과를 반환합니다.";
        } else if (status == HttpStatus.ACCEPTED) {
            ResponseEntity.BodyBuilder b = ResponseEntity.status(status);
            if (result.getRetryAfterSeconds() != null) {
                b.header("Retry-After", String.valueOf(result.getRetryAfterSeconds()));
            }
            return b.body(ApiResponse.success("포인트 공유가 처리 중입니다. 잠시 후 다시 시도하세요.", status.value(), null));
        } else {
            msg = "모임 지갑으로 포인트 공유를 완료했습니다.";
        }
        return ResponseEntity.status(status)
                .body(ApiResponse.success(msg, status.value(), result.getBody()));
    }

    @PostMapping("/groups/{groupId}/stores/{storeId}/reclaim")
    public ResponseEntity<ApiResponse<PointShareResponseDto>> reclaimPoints(
            @AuthenticationPrincipal Long customerId,
            @PathVariable Long groupId,
            @PathVariable Long storeId,
            @RequestHeader("Idempotency-Key") String idemKey,
            @RequestBody @Valid PointShareRequestDto req
    ) {
        IdempotentResult<PointShareResponseDto> result =
                walletService.reclaimPoints(groupId, customerId, storeId, idemKey, req);

        HttpStatus status = result.getHttpStatus();
        if (result.isReplay()) {
            return ResponseEntity.status(status)
                    .body(ApiResponse.success("이전에 처리된 포인트 회수 결과를 반환합니다.", status.value(), result.getBody()));
        }
        if (status == HttpStatus.ACCEPTED) {
            ResponseEntity.BodyBuilder b = ResponseEntity.status(status);
            if (result.getRetryAfterSeconds() != null) {
                b.header("Retry-After", String.valueOf(result.getRetryAfterSeconds()));
            }
            return b.body(ApiResponse.success("포인트 회수가 처리 중입니다. 잠시 후 다시 시도하세요.", status.value(), null));
        }
        return ResponseEntity.status(status)
                .body(ApiResponse.success("모임 지갑에서 포인트를 회수했습니다.", status.value(), result.getBody()));
    }
}
