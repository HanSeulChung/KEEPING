package com.ssafy.keeping.domain.auth.service;

import com.ssafy.keeping.domain.auth.enums.UserRole;
import com.ssafy.keeping.domain.auth.security.JwtProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
@RequiredArgsConstructor
public class TokenService {

    private final JwtProvider jwtProvider;
    private final StringRedisTemplate redis;

    // 토큰 발급
    public TokenResponse issueTokens(Long userId, UserRole userRole) {
        String accessToken = jwtProvider.generateAccessToken(userId, userRole);
        String refreshToken = jwtProvider.generateRefreshToken(userId);

        String key = buildKey(userId);
        redis.opsForValue().set(key, refreshToken, Duration.ofDays(7));

        return TokenResponse.builder().userId(userId).role(userRole).accessToken(accessToken).refreshToken(refreshToken).build();
    }

//    public TokenResponse issueTokens(Long userId, UserRole userRole, String deviceId) {
//        String accessToken = jwtProvider.generateAccessToken(userId, userRole);
//        String refreshToken = jwtProvider.generateRefreshToken(userId);
//
//        String key = buildKey(userId, deviceId);
//        redis.opsForValue().set(key, refreshToken, Duration.ofDays(7));
//
//        return TokenResponse.builder().userId(userId).role(userRole).accessToken(accessToken).refreshToken(refreshToken).build();
//    }

    // refreshtoken 처리
    public TokenResponse reissueToken(Long userId, String oldRefreshToken, UserRole userRole) {
        String key = buildKey(userId);
        String saved = redis.opsForValue().get(key);

        if (saved == null || !saved.equals(oldRefreshToken) || !jwtProvider.validateToken(oldRefreshToken)) {
            throw new RuntimeException("Invalid refresh token");
        }

        redis.delete(key);

        String newAccessToken = jwtProvider.generateAccessToken(userId, userRole);
        String newRefreshToken = jwtProvider.generateRefreshToken(userId);

        redis.opsForValue().set(key, newRefreshToken, Duration.ofDays(7));

        return TokenResponse.builder().accessToken(newAccessToken).refreshToken(newRefreshToken).build();
    }


//    public TokenResponse reissueToken(Long userId, String oldRefreshToken, UserRole userRole, String deviceId) {
//        String key = buildKey(userId, deviceId);
//        String saved = redis.opsForValue().get(key);
//
//        if (saved == null || !saved.equals(oldRefreshToken) || !jwtProvider.validateToken(oldRefreshToken)) {
//            throw new RuntimeException("Invalid refresh token");
//        }
//
//        redis.delete(key);
//
//        String newAccessToken = jwtProvider.generateAccessToken(userId, userRole);
//        String newRefreshToken = jwtProvider.generateRefreshToken(userId);
//
//        redis.opsForValue().set(key, newRefreshToken, Duration.ofDays(7));
//
//        return TokenResponse.builder().accessToken(newAccessToken).refreshToken(newRefreshToken).build();
//    }


    private String buildKey(Long userId) {
        return "auth:rt" + userId;
    }

//    private String buildKey(Long userId, String deviceId) {
//        return "auth:rt" + userId + ":" + deviceId;
//    }
}
