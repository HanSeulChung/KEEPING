package com.ssafy.keeping.domain.store.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StatisticsRequestDto {

    @NotNull(message = "점주 ID는 필수입니다.")
    @Positive(message = "점주 ID는 양수여야 합니다.")
    private Long ownerId;

    private LocalDate date;

    private LocalDate startDate;

    private LocalDate endDate;
}