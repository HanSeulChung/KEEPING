package com.ssafy.keeping.domain.core.wallet.dto;

import com.ssafy.keeping.domain.core.wallet.model.Wallet;

import java.time.LocalDateTime;
import java.util.List;

public record WalletResponseDto(
        Long walletId, Wallet.WalletType WalletType,
        Long connectId, // customerId or groupId
        List<WalletStoreBalanceResponseDto> storeBalances,
        LocalDateTime createdAt
) {}
