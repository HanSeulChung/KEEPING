package com.ssafy.keeping.domain.store.service;

import com.ssafy.keeping.domain.menuCategory.service.MenuCategoryService;
import com.ssafy.keeping.domain.store.constant.StoreStatus;
import com.ssafy.keeping.domain.store.dto.StoreEditRequestDto;
import com.ssafy.keeping.domain.store.dto.StorePublicDto;
import com.ssafy.keeping.domain.store.dto.StoreRequestDto;
import com.ssafy.keeping.domain.store.dto.StoreResponseDto;
import com.ssafy.keeping.domain.store.model.Store;
import com.ssafy.keeping.domain.store.repository.StoreRepository;
import com.ssafy.keeping.domain.user.owner.model.Owner;
import com.ssafy.keeping.domain.user.owner.repository.OwnerRepository;
import com.ssafy.keeping.domain.wallet.model.WalletStoreBalance;
import com.ssafy.keeping.domain.wallet.repository.WalletStoreBalanceRepository;
import com.ssafy.keeping.global.exception.CustomException;
import com.ssafy.keeping.global.exception.constants.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class StoreService {
    private final StoreRepository storeRepository;
    private final OwnerRepository ownerRepository;
    private final WalletStoreBalanceRepository balanceRepository;

    /*
     * ==================================
     * 가게 주인(owner) role api 에서 사용할 service 로직
     * ==================================
     * */
    public StoreResponseDto createStore(Long ownerId, StoreRequestDto requestDto) {

        String taxIdNumber = requestDto.getTaxIdNumber();
        String address = requestDto.getAddress();

        boolean exists = storeRepository.existsByTaxIdNumberAndAddress(taxIdNumber, address);
        if (exists) {
            throw new CustomException(ErrorCode.STORE_ALREADY_EXISTS);
        }

        Owner owner = ownerRepository.findById(ownerId).orElseThrow(
                () -> new CustomException(ErrorCode.OWNER_NOT_FOUND)
        );

        // TODO: 이미지 파일은 추후
        String imgUrl = makeImgUrl(requestDto.getImgFile());
        return StoreResponseDto.fromEntity(
                storeRepository.save(
                        Store.builder()
                                .owner(owner)
                                .taxIdNumber(requestDto.getTaxIdNumber())
                                .storeName(requestDto.getStoreName())
                                .address(requestDto.getAddress())
                                .phoneNumber(requestDto.getPhoneNumber())
                                .merchantId(requestDto.getMerchantId())
                                .category(requestDto.getCategory())
                                .bankAccount(requestDto.getBankAccount())
                                .description(requestDto.getDescription())
                                .storeStatus(StoreStatus.ACTIVE)
                                .imgUrl(imgUrl)
                                .build()
                )
        );
    }

    public static String makeImgUrl(MultipartFile file) {
        return "random_img_url";
    }

    @Transactional
    public StoreResponseDto editStore(Long storeId, Long ownerId, StoreEditRequestDto requestDto) {
        Owner owner = validOwner(ownerId);
        Store store = validStore(storeId);
        if (!store.getOwner().getOwnerId().equals(owner.getOwnerId()))
            throw new CustomException(ErrorCode.OWNER_NOT_MATCH);

        if (!Objects.equals(store.getStoreStatus(), StoreStatus.ACTIVE)) {
            throw new CustomException(ErrorCode.STORE_INVALID); // 승인 상태일때만 edit 허용
        }

        String editImgUrl = makeImgUrl(requestDto.getImgFile());
        String taxId = store.getTaxIdNumber();
        String address = requestDto.getAddress();

        boolean exists = storeRepository.existsByTaxIdNumberAndAddress(taxId, address);
        if (exists) {
            throw new CustomException(ErrorCode.STORE_ALREADY_EXISTS);
        }

        store.patchStore(requestDto, editImgUrl);

        return StoreResponseDto.fromEntity(
                storeRepository.save(store)
        );
    }

    @Transactional
    public StoreResponseDto deleteStore(Long storeId, Long ownerId) {
        Owner owner = validOwner(ownerId);
        Store store = validStore(storeId);

        if (!store.getOwner().getOwnerId().equals(owner.getOwnerId()))
            throw new CustomException(ErrorCode.OWNER_NOT_MATCH);

        boolean hasPositive = balanceRepository
                .existsPositiveBalanceForStoreWithLock(storeId); // 아래 쿼리 참조

        StoreStatus status = hasPositive ? StoreStatus.SUSPENDED : StoreStatus.DELETED;
        store.deleteStore(status);

        return StoreResponseDto.fromEntity(
                storeRepository.save(store)
        );
    }

    /*
     * ==================================
     *  일반 고객 api 에서 사용할 service 로직
     * ==================================
     * */
    public List<StorePublicDto> getAllStore() {
        List<StorePublicDto> allApprovedStoreDto =
                storeRepository.findPublicAllApprovedStore(StoreStatus.ACTIVE);
        return allApprovedStoreDto;
    }

    public StorePublicDto getStoreByStoreId(Long storeId) {
        return storeRepository.findPublicById(storeId, StoreStatus.ACTIVE).orElseThrow(
                () -> new CustomException(ErrorCode.STORE_NOT_FOUND));
    }

    public List<StorePublicDto> getStoreByStoreName(String storeName) {
        String name = storeName == null ? "" : storeName.trim();
        if (name.isEmpty()) {
            // 이름이 비어있으면 전체 조회
            return storeRepository.findPublicAllApprovedStore(StoreStatus.ACTIVE);
        }
        name = name.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");

        List<StorePublicDto> similarityByNameStoreDto
                = storeRepository.findPublicAllSimilarityByName(name, StoreStatus.ACTIVE);

        return similarityByNameStoreDto;
    }

    private Owner validOwner(Long ownerId) {
        return ownerRepository.findById(ownerId).orElseThrow(
                () -> new CustomException(ErrorCode.OWNER_NOT_FOUND)
        );
    }
    private Store validStore(Long storeId) {
        return storeRepository.findById(storeId).orElseThrow(
                () -> new CustomException(ErrorCode.STORE_NOT_FOUND)
        );
    }
}
