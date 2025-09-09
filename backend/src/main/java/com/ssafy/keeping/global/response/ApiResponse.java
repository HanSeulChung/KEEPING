package com.ssafy.keeping.global.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {

    private boolean success;
    private HttpStatus httpStatus;
    private String message;
    private T data;
    private LocalDateTime timestamp;

    public static <T> ApiResponse<T> success(String message, HttpStatus httpStatus, T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .httpStatus(httpStatus)
                .message(message)
                .data(data)
                .timestamp(LocalDateTime.now())
                .build();
    }

    public static <T> ApiResponse<T> error(String message, HttpStatus httpStatus) {
        return ApiResponse.<T>builder()
                .success(false)
                .httpStatus(httpStatus)
                .message(message)
                .data(null)
                .timestamp(LocalDateTime.now())
                .build();
    }
}