package com.ssafy.keeping.domain.store.dto;


import jakarta.annotation.Nullable;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
@AllArgsConstructor
public class StoreRequestDto {
    @NotBlank
    private String taxId;
    @NotBlank
    private String storeName;
    @NotBlank
    private String address;
    @NotBlank
    private String phoneNumber;
    @NotBlank
    private String businessSector;
    @NotBlank
    private String businessType;
    @NotBlank
    private String bankAccount;
    @NotBlank
    private String category;
    @NotNull
    private Long merchantId;
    //TODO: 파일서버 구축 후 수정
    @Nullable
    private MultipartFile imgFile;
}
