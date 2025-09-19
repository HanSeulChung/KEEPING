package com.ssafy.keeping.domain.wallet.controller;

import com.ssafy.keeping.domain.wallet.dto.PointShareRequestDto;
import com.ssafy.keeping.domain.wallet.dto.PointShareResponseDto;
import com.ssafy.keeping.domain.wallet.dto.WalletResponseDto;
import com.ssafy.keeping.domain.wallet.dto.PersonalWalletBalanceResponseDto;
import com.ssafy.keeping.domain.wallet.dto.GroupWalletBalanceResponseDto;
import com.ssafy.keeping.domain.wallet.dto.WalletStoreDetailResponseDto;
import com.ssafy.keeping.domain.wallet.service.WalletServiceHS;
import com.ssafy.keeping.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;

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

    @GetMapping("/individual/{customerId}/balance")
    public ResponseEntity<ApiResponse<PersonalWalletBalanceResponseDto>> getPersonalWalletBalance(
            @PathVariable Long customerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        PersonalWalletBalanceResponseDto dto = walletService.getPersonalWalletBalance(customerId, pageable);
        return ResponseEntity.ok(ApiResponse.success("개인 지갑 잔액 조회에 성공했습니다.", HttpStatus.OK.value(), dto));
    }

    @GetMapping("/groups/{groupId}/{customerId}/balance")
    public ResponseEntity<ApiResponse<GroupWalletBalanceResponseDto>> getGroupWalletBalance(
            @PathVariable Long groupId,
            @PathVariable Long customerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        GroupWalletBalanceResponseDto dto = walletService.getGroupWalletBalance(groupId, customerId, pageable);
        return ResponseEntity.ok(ApiResponse.success("모임 지갑 잔액 조회에 성공했습니다.", HttpStatus.OK.value(), dto));
    }

    /**
     * 개인지갑 - 특정 가게의 상세 정보 조회
     */
    @GetMapping("/individual/{customerId}/stores/{storeId}/detail")
    public ResponseEntity<ApiResponse<WalletStoreDetailResponseDto>> getPersonalWalletStoreDetail(
            @PathVariable Long customerId,
            @PathVariable Long storeId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        WalletStoreDetailResponseDto dto = walletService.getPersonalWalletStoreDetail(customerId, storeId, pageable);
        return ResponseEntity.ok(ApiResponse.success("개인 지갑 가게별 상세 정보 조회에 성공했습니다.", HttpStatus.OK.value(), dto));
    }

    /**
     * 모임지갑 - 특정 가게의 상세 정보 조회
     */
    @GetMapping("/groups/{groupId}/{customerId}/stores/{storeId}/detail")
    public ResponseEntity<ApiResponse<WalletStoreDetailResponseDto>> getGroupWalletStoreDetail(
            @PathVariable Long groupId,
            @PathVariable Long customerId,
            @PathVariable Long storeId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        WalletStoreDetailResponseDto dto = walletService.getGroupWalletStoreDetail(groupId, customerId, storeId, pageable);
        return ResponseEntity.ok(ApiResponse.success("모임 지갑 가게별 상세 정보 조회에 성공했습니다.", HttpStatus.OK.value(), dto));
    }

}
