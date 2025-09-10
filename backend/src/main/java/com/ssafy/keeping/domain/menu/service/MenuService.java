package com.ssafy.keeping.domain.menu.service;

import com.ssafy.keeping.domain.menu.dto.MenuEditRequestDto;
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

import java.util.List;
import java.util.Objects;
import java.util.Optional;

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

    public MenuResponseDto editMenu(Long storeId, Long menuId, MenuEditRequestDto requestDto) {
        Menu menu = menuRepository.findByMenuIdAndStore_StoreId(menuId, storeId)
                .orElseThrow(() -> new CustomException(ErrorCode.MENU_NOT_FOUND));

        MenuCategory category = menuCategoryRepository.findById(requestDto.getCategoryId())
                .orElseThrow(() -> new CustomException(ErrorCode.MENU_CATEGORY_NOT_FOUND));
        if (!category.getStore().getStoreId().equals(storeId))
            throw new CustomException(ErrorCode.STORE_NOT_MATCH);

        boolean changed = !menu.getCategory().getCategoryId().equals(requestDto.getCategoryId());
        int order = changed ? menuRepository.nextOrder(storeId, requestDto.getCategoryId())
                : menu.getDisplayOrder();
        if (changed) menu.changeCategory(category);

        String imgUrl = menu.getImgUrl();
        if (requestDto.getImgFile() != null && !requestDto.getImgFile().isEmpty()) {
            imgUrl = StoreService.makeImgUrl(requestDto.getImgFile());
        }

        int price = requestDto.getPrice();
        String desc = Optional.ofNullable(requestDto.getDescription())
                .filter(s -> !s.isBlank()).orElse(menu.getDescription());
        String name = Optional.ofNullable(requestDto.getMenuName()).orElse(menu.getMenuName());

        menu.editMenu(name, imgUrl, price, desc, order);

        return new MenuResponseDto(
                menu.getMenuId(), storeId, menu.getMenuName(),
                menu.getCategory().getCategoryId(), menu.getCategory().getCategoryName(),
                menu.getDisplayOrder(), menu.isSoldOut());
    }

    public List<MenuResponseDto> getAllMenus(Long storeId) {
        storeRepository.findById(storeId).orElseThrow(
                () -> new CustomException(ErrorCode.STORE_NOT_FOUND)
        );

        return menuRepository.findAllMenusByStoreId(storeId);
    }

    public void deleteMenu(Long storeId, Long menusId) {
        Menu menu = menuRepository.findByMenuIdAndStore_StoreId(menusId, storeId)
                .orElseThrow(() -> new CustomException(ErrorCode.MENU_NOT_FOUND));

        menuRepository.deleteById(menusId);
    }
}
