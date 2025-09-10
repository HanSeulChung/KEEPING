package com.ssafy.keeping.domain.menu.controller;

import com.ssafy.keeping.domain.menu.dto.MenuRequestDto;
import com.ssafy.keeping.domain.menu.dto.MenuResponseDto;
import com.ssafy.keeping.domain.menu.service.MenuService;
import com.ssafy.keeping.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/stores/{storeId}/menus")
@RequiredArgsConstructor
public class MenuController {
    private final MenuService menuService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<MenuResponseDto>> createMenus(
            @PathVariable Long storeId,
            @Valid @ModelAttribute MenuRequestDto requestDto
    ) {
        MenuResponseDto dto = menuService.createMenu(storeId, requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("메뉴가 등록되었습니다", HttpStatus.CREATED.value(), dto));
    }


}
