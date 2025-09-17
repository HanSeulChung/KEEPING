package com.ssafy.keeping.domain.core.wallet.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class PointShareRequestDto {
    @NotNull
    private Long individualWalletId;
    @NotNull
    private Long groupWalletId;
    @NotNull
    private BigDecimal shareAmount;
}
