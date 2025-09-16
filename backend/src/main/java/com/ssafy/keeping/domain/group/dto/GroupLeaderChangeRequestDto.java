package com.ssafy.keeping.domain.group.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class GroupLeaderChangeRequestDto {
    @NotNull
    private Long newGroupLeaderId;
}
