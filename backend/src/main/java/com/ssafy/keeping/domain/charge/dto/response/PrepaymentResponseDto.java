package com.ssafy.keeping.domain.charge.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class PrepaymentResponseDto {

    private boolean success;
    private String message;
    private PrepaymentData data;

    @Getter
    @NoArgsConstructor(access = AccessLevel.PROTECTED)
    @AllArgsConstructor
    @Builder
    public static class PrepaymentData {
        private Long transactionId;
        private String transactionUniqueNo;
        private Long storeId;
        private String storeName;
        private BigDecimal paymentAmount;
        private LocalDateTime transactionTime;
        private BigDecimal remainingBalance;
    }

    public static PrepaymentResponseDto success(PrepaymentData data) {
        return PrepaymentResponseDto.builder()
                .success(true)
                .message("선결제가 성공적으로 완료되었습니다.")
                .data(data)
                .build();
    }

    public static PrepaymentResponseDto fail(String message) {
        return PrepaymentResponseDto.builder()
                .success(false)
                .message(message)
                .data(null)
                .build();
    }
}