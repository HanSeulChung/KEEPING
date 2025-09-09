package com.ssafy.keeping.domain.store.service;

import com.ssafy.keeping.domain.menuCategory.dto.MenuCategoryEditRequestDto;
import com.ssafy.keeping.domain.menuCategory.dto.MenuCategoryRequestDto;
import com.ssafy.keeping.domain.menuCategory.dto.MenuCategoryResponseDto;
import com.ssafy.keeping.domain.menuCategory.service.MenuCategoryService;
import com.ssafy.keeping.domain.store.constant.StoreStatus;
import com.ssafy.keeping.domain.store.dto.StoreEditRequestDto;
import com.ssafy.keeping.domain.store.dto.StorePublicDto;
import com.ssafy.keeping.domain.store.dto.StoreRequestDto;
import com.ssafy.keeping.domain.store.dto.StoreResponseDto;
import com.ssafy.keeping.domain.store.model.Store;
import com.ssafy.keeping.domain.store.repository.StoreRepository;
import com.ssafy.keeping.global.exception.CustomException;
import com.ssafy.keeping.global.exception.constants.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class StoreService {
    private final StoreRepository storeRepository;
    private final MenuCategoryService menuCategoryService;

    /*
     * ==================================
     * 가게 주인(owner) role api 에서 사용할 service 로직
     * ==================================
     * */
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

        if (!Objects.equals(store.getStoreStatus(), StoreStatus.APPROVED)) {
            throw new CustomException(ErrorCode.STORE_INVALID); // 승인 상태일때만 edit 허용
        }

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

    public MenuCategoryResponseDto createMenuCategory(Long storeId, MenuCategoryRequestDto requestDto) {
        storeRepository.findPublicById(storeId, StoreStatus.APPROVED).orElseThrow(
                () -> new CustomException(ErrorCode.STORE_NOT_FOUND));

        // TODO: store 주인 id와 현재 접근하고 있는(principal에서의 id) 비교

        return menuCategoryService.createMenuCategory(storeId, requestDto);
    }

    public List<MenuCategoryResponseDto> getAllMajorMenuCategory(Long storeId) {
        storeRepository.findPublicById(storeId, StoreStatus.APPROVED).orElseThrow(
                () -> new CustomException(ErrorCode.STORE_NOT_FOUND));
        return menuCategoryService.getAllMajorCategory(storeId);
    }

    public MenuCategoryResponseDto editMenuCategory(Long storeId, Long categoryId, MenuCategoryEditRequestDto requestDto) {
        storeRepository.findPublicById(storeId, StoreStatus.APPROVED).orElseThrow(
                () -> new CustomException(ErrorCode.STORE_NOT_FOUND));

        // TODO: store 주인 id와 현재 접근하고 있는(principal에서의 id) 비교

        return menuCategoryService.editMenuCategory(storeId, categoryId, requestDto);
    }

    /*
    * ==================================
    *  일반 고객 api 에서 사용할 service 로직
    * ==================================
    * */
    public List<StorePublicDto> getAllStore() {
        List<StorePublicDto> allApprovedStoreDto =
                storeRepository.findPublicAllApprovedStore(StoreStatus.APPROVED);
        return allApprovedStoreDto;
    }

    public StorePublicDto getStoreByStoreId(Long storeId) {
        return storeRepository.findPublicById(storeId, StoreStatus.APPROVED).orElseThrow(
                () -> new CustomException(ErrorCode.STORE_NOT_FOUND));
    }

    public List<StorePublicDto> getStoreByStoreName(String storeName) {
        String name = storeName == null ? "" : storeName.trim();
        if (name.isEmpty()) {
            // 이름이 비어있으면 전체 조회
            return storeRepository.findPublicAllApprovedStore(StoreStatus.APPROVED);
        }
        name = name.replace("\\","\\\\").replace("%","\\%").replace("_","\\_");

        List<StorePublicDto> similarityByNameStoreDto
                = storeRepository.findPublicAllSimilarityByName(name, StoreStatus.APPROVED);

        return similarityByNameStoreDto;
    }
}
