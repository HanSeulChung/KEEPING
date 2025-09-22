package com.ssafy.keeping.domain.charge.dto.ssafyapi.response;

import lombok.*;
import java.util.List;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class SsafyCardInquiryResponseDto {

    private SsafyApiResponseHeaderDto Header;
    private List<SsafyCardInquiryRecDto> REC;

    public boolean isSuccess() {
        return Header != null && "H0000".equals(Header.getResponseCode());
    }
}