package com.ssafy.keeping.domain.favorite.service;

import com.ssafy.keeping.domain.favorite.dto.FavoriteCheckResponseDto;
import com.ssafy.keeping.domain.favorite.dto.FavoriteStoreDetailDto;
import com.ssafy.keeping.domain.favorite.dto.FavoriteToggleResponseDto;
import com.ssafy.keeping.domain.favorite.dto.StoreFavoriteResponseDto;
import com.ssafy.keeping.domain.favorite.model.StoreFavorite;
import com.ssafy.keeping.domain.favorite.repository.StoreFavoriteRepository;
import com.ssafy.keeping.domain.store.model.Store;
import com.ssafy.keeping.domain.store.repository.StoreRepository;
import com.ssafy.keeping.domain.user.customer.model.Customer;
import com.ssafy.keeping.domain.user.customer.repository.CustomerRepository;
import com.ssafy.keeping.global.exception.CustomException;
import com.ssafy.keeping.global.exception.constants.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StoreFavoriteService {

    private final StoreFavoriteRepository storeFavoriteRepository;
    private final CustomerRepository customerRepository;
    private final StoreRepository storeRepository;

    @Transactional
    public FavoriteToggleResponseDto toggleFavorite(Long customerId, Long storeId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new CustomException(ErrorCode.STORE_NOT_FOUND));

        Optional<StoreFavorite> existingFavorite =
                storeFavoriteRepository.findByCustomerIdAndStoreId(customerId, storeId);

        if (existingFavorite.isPresent()) {
            StoreFavorite favorite = existingFavorite.get();

            if (favorite.isActive()) {
                favorite.cancel();
                return new FavoriteToggleResponseDto(
                        customerId,
                        storeId,
                        store.getStoreName(),
                        false,
                        favorite.getFavoriteNumber(),
                        LocalDateTime.now()
                );
            } else {
                favorite.reactivate();
                return new FavoriteToggleResponseDto(
                        customerId,
                        storeId,
                        store.getStoreName(),
                        true,
                        favorite.getFavoriteNumber(),
                        LocalDateTime.now()
                );
            }
        } else {
            String favoriteNumber = generateFavoriteNumber(customerId);
            StoreFavorite newFavorite = StoreFavorite.builder()
                    .customer(customer)
                    .store(store)
                    .favoriteNumber(favoriteNumber)
                    .build();

            storeFavoriteRepository.save(newFavorite);

            return new FavoriteToggleResponseDto(
                    customerId,
                    storeId,
                    store.getStoreName(),
                    true,
                    favoriteNumber,
                    LocalDateTime.now()
            );
        }
    }

    @Transactional(readOnly = true)
    public StoreFavoriteResponseDto getFavoriteStores(Long customerId, Pageable pageable) {
        if (!customerRepository.existsById(customerId)) {
            throw new CustomException(ErrorCode.USER_NOT_FOUND);
        }

        Page<FavoriteStoreDetailDto> favoriteStores =
                storeFavoriteRepository.findActiveFavoritesByCustomerId(customerId, pageable);

        long totalCount = storeFavoriteRepository.countActiveFavoritesByCustomerId(customerId);

        return new StoreFavoriteResponseDto(
                customerId,
                totalCount,
                favoriteStores
        );
    }

    @Transactional(readOnly = true)
    public FavoriteCheckResponseDto checkFavoriteStatus(Long customerId, Long storeId) {
        if (!customerRepository.existsById(customerId)) {
            throw new CustomException(ErrorCode.USER_NOT_FOUND);
        }

        if (!storeRepository.existsById(storeId)) {
            throw new CustomException(ErrorCode.STORE_NOT_FOUND);
        }

        Optional<StoreFavorite> activeFavorite =
                storeFavoriteRepository.findActiveByCustomerIdAndStoreId(customerId, storeId);

        return new FavoriteCheckResponseDto(
                customerId,
                storeId,
                activeFavorite.isPresent(),
                activeFavorite.map(StoreFavorite::getFavoriteNumber).orElse(null)
        );
    }

    private String generateFavoriteNumber(Long customerId) {
        return "FAV-" + customerId + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}