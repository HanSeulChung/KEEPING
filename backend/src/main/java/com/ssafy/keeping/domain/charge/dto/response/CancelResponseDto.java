package com.ssafy.keeping.domain.charge.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class CancelResponseDto {
    
    private Long cancelTransactionId;
    private String TransactionUniqueNo;
    private BigDecimal cancelAmount;
    private LocalDateTime cancelTime;
    private BigDecimal remainingBalance;
}