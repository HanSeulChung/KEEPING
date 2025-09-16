package com.ssafy.keeping.domain.core.wallet.dto;

import com.ssafy.keeping.domain.core.wallet.model.Wallet;

import java.time.LocalDateTime;

public record WalletResponseDto(
        Long walletId, Wallet.WalletType WalletType,
        Long connectId, // customerId or groupId
        LocalDateTime createdAt
) {}
