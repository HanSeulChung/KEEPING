package com.ssafy.keeping.domain.menuCategory.service;

import com.ssafy.keeping.domain.menuCategory.dto.MenuCategoryEditRequestDto;
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
import java.util.Objects;

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
                saved.getCategoryId(), saved.getStore().getStoreId(), saved.getParent() == null ? null : saved.getParent().getCategoryId(),
                saved.getCategoryName(), saved.getDisplayOrder(), saved.getCreatedAt()
        );
    }

    public List<MenuCategoryResponseDto> getAllMajorCategory(Long storeId) {
        return menuCategoryRepository.findAllMajorCategoryByStoreId(storeId);
    }

    @Transactional
    public MenuCategoryResponseDto editMenuCategory(Long storeId, Long categoryId, MenuCategoryEditRequestDto requestDto) {
        MenuCategory menuCategory = menuCategoryRepository.findById(categoryId).orElseThrow(
                () -> new CustomException(ErrorCode.MENU_CATEGORY_NOT_FOUND)
        );

        if (!Objects.equals(storeId, menuCategory.getStore().getStoreId()))
            throw new CustomException(ErrorCode.STORE_NOT_MATCH);

        if (menuCategoryRepository.existsDuplicationName(storeId, requestDto.parentId, requestDto.categoryName, categoryId))
            throw new CustomException(ErrorCode.DUPLICATE_RESOURCE);

        MenuCategory parent = null;
        if (requestDto.parentId != null) parent = menuCategoryRepository.getReferenceById(requestDto.getParentId());
        MenuCategory beforeParent = menuCategory.getParent();
        if (!Objects.equals(requestDto.getParentId(), beforeParent== null ? null : beforeParent.getCategoryId()))
            menuCategory.changeOrder(menuCategoryRepository.nextOrder(storeId, parent == null ? null : parent.getCategoryId()));

        menuCategory.changeNameAndParent(requestDto.categoryName, parent);
        // 더티 체킹으로 save
        return toDto(menuCategory);
    }

    public void deleteMenuCategory(Long storeId, Long categoryId) {
        MenuCategory menuCategory = menuCategoryRepository.findById(categoryId).orElseThrow(
                () -> new CustomException(ErrorCode.MENU_CATEGORY_NOT_FOUND)
        );

        if (!Objects.equals(storeId, menuCategory.getStore().getStoreId()))
            throw new CustomException(ErrorCode.STORE_NOT_MATCH);

        if (menuCategoryRepository.hasChildren(storeId, categoryId))
            throw new CustomException(ErrorCode.MENU_CATEGORY_HAS_CHILDREN);

        menuCategoryRepository.delete(menuCategory);
    }

    private MenuCategoryResponseDto toDto(MenuCategory menuCategory) {
        Long pid = menuCategory.getParent()==null ? null : menuCategory.getParent().getCategoryId();
        return new MenuCategoryResponseDto(
                menuCategory.getCategoryId(), menuCategory.getStore().getStoreId(), pid,
                menuCategory.getCategoryName(), menuCategory.getDisplayOrder(), menuCategory.getCreatedAt());
    }
}