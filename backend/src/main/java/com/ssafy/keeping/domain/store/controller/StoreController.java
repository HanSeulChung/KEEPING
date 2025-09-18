package com.ssafy.keeping.domain.store.controller;


import com.ssafy.keeping.domain.menuCategory.dto.MenuCategoryEditRequestDto;
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
    // TODO: owner principal로 대체
    @PostMapping(value="/{ownerId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<StoreResponseDto>> createStore(
            @PathVariable Long ownerId,
            @Valid @ModelAttribute StoreRequestDto requestDto
    ) {
        StoreResponseDto dto = storeService.createStore(ownerId, requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("매장이 등록되었습니다", HttpStatus.CREATED.value(), dto));
    }

    /*
     * 가게 주인이 사용하는 api - 가게 수정 patch
     * */
    @PatchMapping(value="/{storeId}/{ownerId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<StoreResponseDto>> editStore(
            @PathVariable Long ownerId,
            @PathVariable Long storeId,
            @Valid @ModelAttribute StoreEditRequestDto requestDto
    ) {
        StoreResponseDto dto = storeService.editStore(storeId, ownerId, requestDto);
        return ResponseEntity.ok(ApiResponse.success("매장이 수정되었습니다", HttpStatus.OK.value(), dto));
    }

    /*
     * 가게 주인이 사용하는 api - 가게 삭제 delete
     * */
    @DeleteMapping("/{storeId}/{ownerId}")
    public ResponseEntity<ApiResponse<StoreResponseDto>> deleteStore(
            @PathVariable Long ownerId,
            @PathVariable Long storeId
    ) {
        return ResponseEntity.ok(ApiResponse.success("매장이 삭제되었습니다", HttpStatus.OK.value(),
                storeService.deleteStore(storeId, ownerId)));
    }
    /* =================================
     * 일반 고객이 가게 조회하는 api
     * ==================================
     * */
    @GetMapping(params = "!name")
    public ResponseEntity<ApiResponse<List<StorePublicDto>>> getAllStore() {
        return ResponseEntity.ok(ApiResponse.success("전체 매장이 조회되었습니다", HttpStatus.OK.value(), storeService.getAllStore()));
    }

    @GetMapping("/{storeId}")
    public ResponseEntity<ApiResponse<StorePublicDto>> getStore(
            @PathVariable Long storeId
    ) {
        return ResponseEntity.ok(ApiResponse.success("해당 store id로 매장이 조회되었습니다.", HttpStatus.OK.value(), storeService.getStoreByStoreId(storeId)));
    }

    @GetMapping(params = "name")
    public ResponseEntity<ApiResponse<List<StorePublicDto>>> getStore(
            @RequestParam String name
    ) {
        return ResponseEntity.ok(ApiResponse.success("store name으로 매장이 조회되었습니다.", HttpStatus.OK.value(), storeService.getStoreByStoreName(name)));
    }
}
