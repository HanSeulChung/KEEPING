package com.ssafy.keeping.domain.favorite.dto;

import java.time.LocalDateTime;

public record FavoriteToggleResponseDto(
        Long customerId,
        Long storeId,
        String storeName,
        boolean isFavorited,
        String favoriteNumber,
        LocalDateTime actionTime
) {
}