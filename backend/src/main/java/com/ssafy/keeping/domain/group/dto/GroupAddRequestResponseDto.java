package com.ssafy.keeping.domain.group.dto;

import com.ssafy.keeping.domain.group.constant.RequestStatus;

public record GroupAddRequestResponseDto(
   Long groupAddRequestId, String name, RequestStatus status
) {}
