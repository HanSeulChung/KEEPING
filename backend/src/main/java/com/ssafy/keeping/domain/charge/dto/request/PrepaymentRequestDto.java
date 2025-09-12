package com.ssafy.keeping.domain.charge.dto.request;

import lombok.*;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class PrepaymentRequestDto {

    @NotNull(message = "사용자 ID는 필수입니다.")
    @Positive(message = "사용자 ID는 양수여야 합니다.")
    private Long userId;

    @NotBlank(message = "카드 번호는 필수입니다.")
    @Pattern(regexp = "\\d{16}", message = "카드 번호는 16자리 숫자여야 합니다.")
    private String cardNo;

    @NotBlank(message = "CVC는 필수입니다.")
    @Pattern(regexp = "\\d{3}", message = "CVC는 3자리 숫자여야 합니다.")
    private String cvc;

    @NotNull(message = "결제 금액은 필수입니다.")
    @DecimalMin(value = "1000", message = "최소 결제 금액은 1,000원입니다.")
    @DecimalMax(value = "1000000", message = "최대 결제 금액은 1,000,000원입니다.")
    private BigDecimal paymentBalance;
}