package com.ssafy.keeping.domain.group.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GroupRequestDto {
    // 임시 회원 역할
    @NotNull
    private Long groupLeaderId;

    @NotBlank
    private String groupName;
    private String groupDescription;

}
