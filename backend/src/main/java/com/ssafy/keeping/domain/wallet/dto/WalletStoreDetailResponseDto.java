package com.ssafy.keeping.domain.wallet.dto;

import org.springframework.data.domain.Page;
import java.time.LocalDateTime;

public record WalletStoreDetailResponseDto(
        Long storeId,
        String storeName,
        Long currentBalance,                           // 현재 포인트 잔액
        Long firstChargeAmount,                        // 처음 충전한 금액
        Long firstChargePoints,                        // 처음 충전한 포인트 (보너스 포함)
        LocalDateTime firstChargeDate,                 // 처음 충전한 날짜
        Long totalChargedAmount,                       // 총 충전한 금액
        Long totalUsedAmount,                          // 총 사용한 금액
        Page<WalletStoreTransactionDetailDto> transactions  // 거래내역 (페이징)
) {
}