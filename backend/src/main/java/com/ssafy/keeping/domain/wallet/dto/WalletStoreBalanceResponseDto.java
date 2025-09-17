package com.ssafy.keeping.domain.wallet.dto;


import java.math.BigDecimal;
import java.time.LocalDateTime;


public record WalletStoreBalanceResponseDto(
        Long balanceId,
        Long balance,
        LocalDateTime createdAt
) {}
