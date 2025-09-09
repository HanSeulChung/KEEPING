package com.ssafy.keeping.domain.store.controller;


import com.ssafy.keeping.domain.menuCategory.dto.MenuCategoryRequestDto;
import com.ssafy.keeping.domain.menuCategory.dto.MenuCategoryResponseDto;
import com.ssafy.keeping.domain.store.dto.StoreEditRequestDto;
import com.ssafy.keeping.domain.store.dto.StorePublicDto;
import com.ssafy.keeping.domain.store.dto.StoreResponseDto;
import com.ssafy.keeping.domain.store.dto.StoreRequestDto;
import com.ssafy.keeping.domain.store.service.StoreService;
import com.ssafy.keeping.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/stores")
@RequiredArgsConstructor
public class StoreController {
    private final StoreService storeService;

    /*
    * 가게 주인이 사용하는 api - 가게 등록 post
    * */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<StoreResponseDto>> createStore(
            @Valid @ModelAttribute StoreRequestDto requestDto
    ) {
        StoreResponseDto dto = storeService.createStore(requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("매장이 등록되었습니다", HttpStatus.CREATED, dto));
    }

    /*
     * 가게 주인이 사용하는 api - 가게 수정 patch
     * */
    @PatchMapping(value="/{storeId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<StoreResponseDto>> editStore(
            @PathVariable Long storeId,
            @Valid @ModelAttribute StoreEditRequestDto requestDto
    ) {
        StoreResponseDto dto = storeService.editStore(storeId, requestDto);
        return ResponseEntity.ok(ApiResponse.success("매장이 수정되었습니다", HttpStatus.OK, dto));
    }

    /*
     * 가게 주인이 사용하는 api - 가게 삭제 delete
     * */
    @DeleteMapping("/{storeId}")
    public ResponseEntity<ApiResponse<StoreResponseDto>> deleteStore(
            @PathVariable Long storeId
    ) {
        return ResponseEntity.ok(ApiResponse.success("매장이 삭제되었습니다", HttpStatus.OK, storeService.deleteStore(storeId)));
    }

    /*
     * 가게 주인이 가게 메뉴 카테고리를 위한 api - 가게 메뉴 카테고리 등록
     * */
    @PostMapping("/{storeId}/menus/categories")
    public ResponseEntity<ApiResponse<MenuCategoryResponseDto>> createMenuCategory(
            @PathVariable Long storeId,
            @RequestBody MenuCategoryRequestDto requestDto
    ) {
        MenuCategoryResponseDto dto = storeService.createMenuCategory(storeId, requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("메뉴 카테고리가 등록되었습니다", HttpStatus.CREATED, dto));
    }


    /* =================================
     * 일반 고객이 가게 조회하는 api
     * ==================================
     * */
    @GetMapping(params = "!name")
    public ResponseEntity<ApiResponse<List<StorePublicDto>>> getAllStore() {
        return ResponseEntity.ok(ApiResponse.success("전체 매장이 조회되었습니다", HttpStatus.OK, storeService.getAllStore()));
    }

    @GetMapping("/{storeId}")
    public ResponseEntity<ApiResponse<StorePublicDto>> getStore(
            @PathVariable Long storeId
    ) {
        return ResponseEntity.ok(ApiResponse.success("해당 store id로 매장이 조회되었습니다.", HttpStatus.OK, storeService.getStoreByStoreId(storeId)));
    }

    @GetMapping(params = "name")
    public ResponseEntity<ApiResponse<List<StorePublicDto>>> getStore(
            @RequestParam String name
    ) {
        return ResponseEntity.ok(ApiResponse.success("store name으로 매장이 조회되었습니다.", HttpStatus.OK, storeService.getStoreByStoreName(name)));
    }
}
