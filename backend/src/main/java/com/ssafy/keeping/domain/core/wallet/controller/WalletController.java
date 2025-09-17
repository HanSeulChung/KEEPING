package com.ssafy.keeping.domain.core.wallet.controller;

import com.ssafy.keeping.domain.core.wallet.dto.PointShareRequestDto;
import com.ssafy.keeping.domain.core.wallet.dto.PointShareResponseDto;
import com.ssafy.keeping.domain.core.wallet.dto.WalletResponseDto;
import com.ssafy.keeping.domain.core.wallet.service.WalletServiceHS;
import com.ssafy.keeping.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/wallets")
@RequiredArgsConstructor
public class WalletController {
    private final WalletServiceHS walletService;

    // TODO: principal 적용되면 {userId} 삭제
    @GetMapping("/groups/{groupId}/{userId}")
    public ResponseEntity<ApiResponse<WalletResponseDto>> getGroupWallets(
            @PathVariable Long userId,
            @PathVariable Long groupId
    ){
        WalletResponseDto dto = walletService.getGroupWallet(groupId, userId);
        return ResponseEntity.ok(ApiResponse.success("모임 지갑 조회에 성공했습니다.", HttpStatus.OK.value(), dto));
    }
    // 모임 <-> 가게별 공유
    @PostMapping("/groups/{groupId}/{userId}/stores/{storeId}")
    public ResponseEntity<ApiResponse<PointShareResponseDto>> createSharePoints(
            @PathVariable Long userId,
            @PathVariable Long groupId,
            @PathVariable Long storeId,
//            TODO: 현서 커밋 이후 추가(현재 현서 진행중)
//            @RequestHeader("Idempotency-Key") String idemKey,
            @RequestBody @Valid PointShareRequestDto req
    ){
        PointShareResponseDto dto = walletService.sharePoints(groupId, userId, storeId, req);
        return ResponseEntity.ok(ApiResponse.success("모임 지갑에 포인트 공유에 성공했습니다.", HttpStatus.OK.value(), dto));
    }

}
