package com.ssafy.keeping.domain.core.wallet.dto;


import java.math.BigDecimal;
import java.time.LocalDateTime;


public record WalletStoreBalanceResponseDto(
        Long balanceId,
        BigDecimal balance,
        LocalDateTime createdAt
) {}
