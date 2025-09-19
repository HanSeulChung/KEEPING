package com.ssafy.keeping.domain.wallet.dto;

import org.springframework.data.domain.Page;

public record PersonalWalletBalanceResponseDto(
        Long customerId,
        Long walletId,
        Page<WalletStoreBalanceDetailDto> storeBalances
) {
}