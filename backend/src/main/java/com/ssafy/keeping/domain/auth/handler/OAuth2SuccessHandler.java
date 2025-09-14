package com.ssafy.keeping.domain.auth.handler;


import com.ssafy.keeping.domain.auth.Util.CookieUtil;
import com.ssafy.keeping.domain.auth.enums.UserRole;
import com.ssafy.keeping.domain.auth.service.AuthService;
import com.ssafy.keeping.domain.auth.service.TokenResponse;
import com.ssafy.keeping.domain.auth.service.TokenService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final AuthService authService;
    private final TokenService tokenService;
    private final CookieUtil cookieUtil;

    // 추후 환경변수로 저장
    private final String FE_BASE_URL = "http://localhost:3000";
    @Value("${fe.base-url:}")
    private String feBaseUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        System.out.println("=== OAUTH SUCCESS HANDLER START ===");
        System.out.println("[OAUTH SUCCESS] Request URI: " + request.getRequestURI());
        System.out.println("[OAUTH SUCCESS] Query String: " + request.getQueryString());
        System.out.println("[OAUTH SUCCESS] State parameter: " + request.getParameter("state"));
        System.out.println("[OAUTH SUCCESS] Code parameter: " + request.getParameter("code"));

        // role 복원
        UserRole role = authService.extractRoleFromState(request);
        System.out.println("[OAUTH SUCCESS] Extracted role: " + role);
        
        // role이 null인 경우 처리
        if (role == null) {
            System.out.println("[OAUTH] Role is null - redirecting to role selection");
            if (devFallback()) {
                response.setContentType("application/json;charset=UTF-8");
                response.getWriter().write("{\"error\":\"Role not found\", \"message\":\"Please select your role and try again\"}");
                return;
            }
            // 프론트엔드의 role 선택 페이지로 리다이렉트
            response.sendRedirect(feBaseUrl + "/#/auth/select-role");
            return;
        }

        // provider, providerId 추출
        OAuth2AuthenticationToken oauth2Token = (OAuth2AuthenticationToken) authentication;
        String provider = oauth2Token.getAuthorizedClientRegistrationId();

        Map<String, Object> attributes = (Map<String, Object>) oauth2Token.getPrincipal().getAttributes();

        String providerId = String.valueOf(attributes.get("providerId"));
        String email = String.valueOf(attributes.get("email"));
        String imgUrl = String.valueOf(attributes.get("imgUrl"));

        boolean exists = authService.userExists(role, providerId, provider);
        if(exists) {
            // 로그인
            Long userId = authService.getUserId(providerId, provider, role);

//            String deviceId = request.getHeader("X-Device-Id");
//            if (deviceId == null || deviceId.isBlank()) {
//                deviceId = "ua:" + request.getHeader("User-Agent");
//            }

            TokenResponse tokenResponse = tokenService.issueTokens(userId, role);
            cookieUtil.addHttpOnlyRefreshCookie(response, tokenResponse.getRefreshToken(), Duration.ofDays(7));

            if (devFallback()) {
                response.setContentType("application/json;charset=UTF-8");
                response.getWriter().write("{\"mode\":\"login\"}");
                return;
            }

            // 프론트로 리다이렉트
            response.setStatus(HttpServletResponse.SC_SEE_OTHER);
            response.setHeader("Location", feBaseUrl + "/#/auth/done?mode=login&role=" + role);

            return;

        } else {
            // 회원가입
            // 현재 oAuthUser 저장
            String regSessionId = UUID.randomUUID().toString();
            authService.storeSingUpInfo(regSessionId, providerId, provider, email, imgUrl, role);

            if (devFallback()) {
                response.setContentType("application/json;charset=UTF-8");
                response.getWriter().write("{\"mode\":\"signup\",\"regSessionId\":\"" + regSessionId + "\"}");
                return;
            }

            // TODO: 프론트 주소로 변경
            response.sendRedirect("/otp/start?regSessionId=" + regSessionId);
        }


    }

    private boolean devFallback() {
        return feBaseUrl == null || feBaseUrl.isBlank();
    }
}
