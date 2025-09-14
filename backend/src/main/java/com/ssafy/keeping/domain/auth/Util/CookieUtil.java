package com.ssafy.keeping.domain.auth.Util;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

import java.time.Duration;

@Component
public class CookieUtil {

    public void addHttpOnlyRefreshCookie(HttpServletResponse response, String refreshToken, Duration ttl) {
        ResponseCookie responseCookie = ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(ttl)
                .sameSite("Lax")
                .build();

        response.setHeader("Set-Cookie", responseCookie.toString());
    }
}
