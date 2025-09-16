package com.ssafy.keeping.domain.customer.dto.finopenapi;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class SearchUserKeyRequestDto {
    private String userId;  // email
    private String apiKey;
}
