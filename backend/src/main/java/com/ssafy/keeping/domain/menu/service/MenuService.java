package com.ssafy.keeping.domain.menu.service;

import com.ssafy.keeping.domain.menu.dto.MenuRequestDto;
import com.ssafy.keeping.domain.menu.dto.MenuResponseDto;
import com.ssafy.keeping.domain.menu.model.Menu;
import com.ssafy.keeping.domain.menu.repository.MenuRepository;
import com.ssafy.keeping.domain.menuCategory.model.MenuCategory;
import com.ssafy.keeping.domain.menuCategory.repository.MenuCategoryRepository;
import com.ssafy.keeping.domain.store.model.Store;
import com.ssafy.keeping.domain.store.repository.StoreRepository;
import com.ssafy.keeping.domain.store.service.StoreService;
import com.ssafy.keeping.global.exception.CustomException;
import com.ssafy.keeping.global.exception.constants.ErrorCode;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Objects;

@Service
@Transactional
@RequiredArgsConstructor
public class MenuService {
    private final MenuRepository menuRepository;
    private final StoreRepository storeRepository;
    private final MenuCategoryRepository menuCategoryRepository;

    public MenuResponseDto createMenu(Long storeId, MenuRequestDto requestDto) {
        Store store = storeRepository.findById(storeId).orElseThrow(
                () -> new CustomException(ErrorCode.STORE_NOT_FOUND)
        );

        Long categoryId = requestDto.getCategoryId();
        MenuCategory category = menuCategoryRepository.findById(categoryId).orElseThrow(
                () -> new CustomException(ErrorCode.MENU_CATEGORY_NOT_FOUND)
        );

        if(!Objects.equals(storeId, category.getStore().getStoreId())){
            throw new CustomException(ErrorCode.STORE_NOT_MATCH);
        }

        // TODO: 이미지 서버 구축 후 같이 수정
        String imgUrl = StoreService.makeImgUrl(requestDto.getImgFile());
        int order = menuRepository.nextOrder(storeId, categoryId);
        Menu saved = menuRepository.save(
                    Menu.builder()
                            .menuName(requestDto.getMenuName())
                            .store(store)
                            .category(category)
                            .menuName(requestDto.getMenuName())
                            .price(requestDto.getPrice())
                            .description(requestDto.getDescription() == null ?
                                    "" : requestDto.getDescription())
                            .displayOrder(order)
                            .imgUrl(imgUrl)
                            .build()
                    );
        return new MenuResponseDto(
                saved.getMenuId(),
                saved.getStore().getStoreId(), saved.getMenuName(), saved.getCategory().getCategoryId(),
                saved.getCategory().getCategoryName(), saved.getDisplayOrder(), saved.isSoldOut()
        );
    }
}
