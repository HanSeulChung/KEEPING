package com.ssafy.keeping.domain.store.service;

import com.ssafy.keeping.domain.store.constant.StoreStatus;
import com.ssafy.keeping.domain.store.dto.StoreEditRequestDto;
import com.ssafy.keeping.domain.store.dto.StoreRequestDto;
import com.ssafy.keeping.domain.store.dto.StoreResponseDto;
import com.ssafy.keeping.domain.store.model.Store;
import com.ssafy.keeping.domain.store.repository.StoreRepository;
import com.ssafy.keeping.global.exception.CustomException;
import com.ssafy.keeping.global.exception.constants.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class StoreService {
    private final StoreRepository storeRepository;

    public StoreResponseDto createStore(StoreRequestDto requestDto) {

        String taxId = requestDto.getTaxId();
        String address = requestDto.getAddress();

        boolean exists = storeRepository.existsByTaxIdAndAddress(taxId, address);
        if (exists) {
            throw new CustomException(ErrorCode.STORE_ALREADY_EXISTS);
        }

        // TODO: 이미지 파일은 추후, principal 체크 추후
        String imgUrl = makeImgUrl(requestDto.getImgFile());
        return StoreResponseDto.fromEntity(
                storeRepository.save(
                        Store.builder()
                                .taxId(requestDto.getTaxId())
                                .storeName(requestDto.getStoreName())
                                .address(requestDto.getAddress())
                                .phoneNumber(requestDto.getPhoneNumber())
                                .businessSector(requestDto.getBusinessSector())
                                .businessType(requestDto.getBusinessType())
                                .merchantId(requestDto.getMerchantId())
                                .category(requestDto.getCategory())
                                .bankAccount(requestDto.getBankAccount())
                                .description(requestDto.getDescription())
                                .storeStatus(StoreStatus.APPROVED)
                                .imgUrl(imgUrl)
                                .build()
                )
        );
    }

    private String makeImgUrl(MultipartFile file) {
        return "random_img_url";
    }

    public StoreResponseDto editStore(Long storeId, StoreEditRequestDto requestDto) {
        // TODO: 이미지 파일은 추후, principal 체크 추후
        String editImgUrl = makeImgUrl(requestDto.getImgFile());

        Store store = storeRepository.findById(storeId).orElseThrow(
                () -> new CustomException(ErrorCode.STORE_NOT_FOUND)
        );

        String taxId = store.getTaxId();
        String address = requestDto.getAddress();

        boolean exists = storeRepository.existsByTaxIdAndAddress(taxId, address);
        if (exists) {
            throw new CustomException(ErrorCode.STORE_ALREADY_EXISTS);
        }

        store.patchStore(requestDto, editImgUrl);

        return StoreResponseDto.fromEntity(
                storeRepository.save(store)
        );
    }

    public StoreResponseDto deleteStore(Long storeId) {
        Store store = storeRepository.findById(storeId).orElseThrow(
                () -> new CustomException(ErrorCode.STORE_NOT_FOUND)
        );

        StoreStatus storeStatus = StoreStatus.DELETED;
        // TODO: wallet_store_balance 에서 남아있는게 없어야 완전히 DELETE STATUS가 됨.


        store.deleteStore(storeStatus);

        return StoreResponseDto.fromEntity(
                storeRepository.save(store)
        );
    }
}
