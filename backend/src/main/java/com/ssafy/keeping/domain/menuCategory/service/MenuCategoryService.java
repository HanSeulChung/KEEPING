package com.ssafy.keeping.domain.menuCategory.service;

import com.ssafy.keeping.domain.menuCategory.dto.MenuCategoryRequestDto;
import com.ssafy.keeping.domain.menuCategory.dto.MenuCategoryResponseDto;
import com.ssafy.keeping.domain.menuCategory.model.MenuCategory;
import com.ssafy.keeping.domain.menuCategory.repository.MenuCategoryRepository;
import com.ssafy.keeping.domain.store.dto.StorePublicDto;
import com.ssafy.keeping.domain.store.model.Store;
import com.ssafy.keeping.domain.store.repository.StoreRepository;
import com.ssafy.keeping.global.exception.CustomException;
import com.ssafy.keeping.global.exception.constants.ErrorCode;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MenuCategoryService {
    private final StoreRepository storeRepository;
    private final MenuCategoryRepository menuCategoryRepository;

    @Transactional
    public MenuCategoryResponseDto createMenuCategory(Long storeId, MenuCategoryRequestDto requestDto) {
        Long parentId = requestDto.getParentId();

        MenuCategory parentMenuCategory = null;
        if (parentId != null) {
            parentMenuCategory = menuCategoryRepository.findById(parentId).orElseThrow(
                    () -> new CustomException(ErrorCode.MENU_CATEGORY_NOT_FOUND)
            );

            if (!parentMenuCategory.getStore().getStoreId().equals(storeId))
                throw new CustomException(ErrorCode.STORE_NOT_MATCH);
        }
        Store storeRef = storeRepository.getReferenceById(storeId);
        int order = menuCategoryRepository.nextOrder(storeId, requestDto.getParentId());

        MenuCategory saved = menuCategoryRepository.save(
                MenuCategory.builder()
                        .categoryName(requestDto.getCategoryName())
                        .store(storeRef)
                        .parent(parentMenuCategory)
                        .displayOrder(order)
                        .build()
        );

        return new MenuCategoryResponseDto(
                saved.getCategoryId(), saved.getStore().getStoreId(), saved.getParent()==null ? null : saved.getParent().getCategoryId(),
                saved.getCategoryName(), saved.getDisplayOrder(), saved.getCreatedAt()
        );
    }

    public List<MenuCategoryResponseDto> getAllMajorCategory(Long storeId) {
        return menuCategoryRepository.findAllMajorCategoryByStoreId(storeId);
    }
}
