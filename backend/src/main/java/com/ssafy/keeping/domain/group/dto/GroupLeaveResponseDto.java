package com.ssafy.keeping.domain.group.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class GroupLeaveResponseDto {
    private Long groupId;
    private Long customerId;
    private long refundedAmount;   // 환급된 포인트
    private long individualBalance; // 환급 후 개인지갑 잔액
}
