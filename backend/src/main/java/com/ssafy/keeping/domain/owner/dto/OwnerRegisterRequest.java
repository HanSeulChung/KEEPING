package com.ssafy.keeping.domain.owner.dto;

import com.ssafy.keeping.domain.auth.enums.Gender;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class OwnerRegisterRequest {

    private String regSessionId;
//
//    @NotBlank
//    private String email;
//
    @NotNull
    private Gender gender;

//    @NotBlank
//    private String imgUrl;

    private String userKey;
}
