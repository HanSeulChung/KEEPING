package com.ssafy.keeping.domain.charge.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class CancelListResponseDto {
    
    private String transactionUniqueNo;
    private String storeName;
    private BigDecimal paymentAmount;
    private LocalDateTime transactionTime;
    private BigDecimal remainingBalance;
}