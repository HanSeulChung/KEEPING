package com.ssafy.keeping.domain.core.wallet.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PointShareResponseDto(
        Long txOutId,                 // 개인→모임 이체 OUT transaction id
        Long txInId,                  // 모임 지갑 수신 IN  transaction id
        Long individualWalletId,
        Long groupWalletId,
        Long storeId,
        BigDecimal amount,
        BigDecimal newGroupBalance,   // 모임 지갑 해당 매장 잔액
        BigDecimal newIndividualBalance, // 개인 지갑 해당 매장 잔액(차감 후)
        LocalDateTime occurredAt,
        boolean idempotentReplayed    // 멱등키 재실행 여부
) {}