package com.ssafy.keeping.domain.store.dto;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.lang.Nullable;
import org.springframework.web.multipart.MultipartFile;

@Data
@AllArgsConstructor
public class StoreEditRequestDto {

    @NotBlank
    private String storeName;
    @NotBlank
    private String address;
    @NotBlank
    private String phoneNumber;
    //TODO: 파일서버 구축 후 수정
    @Nullable
    private MultipartFile imgFile;
}
