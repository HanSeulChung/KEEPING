package com.ssafy.keeping.domain.store.dto;

import com.ssafy.keeping.domain.store.constant.StoreStatus;
import com.ssafy.keeping.domain.store.model.Store;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Builder
@Getter
public class StoreResponseDto {
    private Long storeId;
    private String taxId;
    private String storeName;
    private String address;
    private String phoneNumber;
    private String businessSector;
    private String businessType;
    private String bankAccount;
    private Long merchantId;
    private String category;
    private StoreStatus storeStatus;
    private String description;
    private LocalDateTime createdAt;
    private String imgUrl;

    public static StoreResponseDto fromEntity(Store store) {
        return StoreResponseDto.builder()
                .storeId(store.getStoreId())
                .taxId(store.getTaxId())
                .storeName(store.getStoreName())
                .address(store.getAddress())
                .phoneNumber(store.getPhoneNumber())
                .businessSector(store.getBusinessSector())
                .businessType(store.getBusinessType())
                .merchantId(store.getMerchantId())
                .category(store.getCategory())
                .createdAt(store.getCreatedAt())
                .bankAccount(store.getBankAccount())
                .storeStatus(store.getStoreStatus())
                .description(store.getDescription())
                .imgUrl(store.getImgUrl())
                .build();
    }
}
