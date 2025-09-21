package com.ssafy.keeping.domain.wallet.dto;

import org.springframework.data.domain.Page;

public record GroupWalletBalanceResponseDto(
        Long groupId,
        Long walletId,
        String groupName,
        Page<WalletStoreBalanceDetailDto> storeBalances
) {
}