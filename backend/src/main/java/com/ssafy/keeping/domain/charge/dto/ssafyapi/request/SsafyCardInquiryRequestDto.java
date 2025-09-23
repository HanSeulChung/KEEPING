package com.ssafy.keeping.domain.charge.dto.ssafyapi.request;

import lombok.*;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class SsafyCardInquiryRequestDto {

    private SsafyApiHeaderDto Header;

    public static SsafyCardInquiryRequestDto create(SsafyApiHeaderDto header) {
        return SsafyCardInquiryRequestDto.builder()
                .Header(header)
                .build();
    }
}