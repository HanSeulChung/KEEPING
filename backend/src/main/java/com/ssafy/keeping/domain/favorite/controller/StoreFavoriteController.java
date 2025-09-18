package com.ssafy.keeping.domain.favorite.controller;

import com.ssafy.keeping.domain.favorite.dto.FavoriteCheckResponseDto;
import com.ssafy.keeping.domain.favorite.dto.FavoriteToggleResponseDto;
import com.ssafy.keeping.domain.favorite.dto.StoreFavoriteResponseDto;
import com.ssafy.keeping.domain.favorite.service.StoreFavoriteService;
import com.ssafy.keeping.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/favorites")
@RequiredArgsConstructor
public class StoreFavoriteController {

    private final StoreFavoriteService storeFavoriteService;

    @PostMapping("/customers/{customerId}/stores/{storeId}")
    public ResponseEntity<ApiResponse<FavoriteToggleResponseDto>> toggleFavorite(
            @PathVariable Long customerId,
            @PathVariable Long storeId
    ) {
        FavoriteToggleResponseDto dto = storeFavoriteService.toggleFavorite(customerId, storeId);
        String message = dto.isFavorited() ? "찜 추가에 성공했습니다." : "찜 취소에 성공했습니다.";
        return ResponseEntity.ok(ApiResponse.success(message, HttpStatus.OK.value(), dto));
    }

    @GetMapping("/customers/{customerId}")
    public ResponseEntity<ApiResponse<StoreFavoriteResponseDto>> getFavoriteStores(
            @PathVariable Long customerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        StoreFavoriteResponseDto dto = storeFavoriteService.getFavoriteStores(customerId, pageable);
        return ResponseEntity.ok(ApiResponse.success("찜 목록 조회에 성공했습니다.", HttpStatus.OK.value(), dto));
    }

    @GetMapping("/customers/{customerId}/stores/{storeId}/check")
    public ResponseEntity<ApiResponse<FavoriteCheckResponseDto>> checkFavoriteStatus(
            @PathVariable Long customerId,
            @PathVariable Long storeId
    ) {
        FavoriteCheckResponseDto dto = storeFavoriteService.checkFavoriteStatus(customerId, storeId);
        return ResponseEntity.ok(ApiResponse.success("찜 상태 확인에 성공했습니다.", HttpStatus.OK.value(), dto));
    }
}