package com.ssafy.keeping.domain.core.wallet.controller;

import com.ssafy.keeping.domain.core.wallet.dto.WalletResponseDto;
import com.ssafy.keeping.domain.core.wallet.service.WalletServiceHS;
import com.ssafy.keeping.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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

}
