package com.ssafy.keeping.domain.auth.handler;

import com.ssafy.keeping.domain.auth.enums.UserRole;
import com.ssafy.keeping.domain.auth.userinfo.KakaoOAuth2UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.core.parameters.P;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.HashMap;
import java.util.Map;

public class OAuth2ProviderRouter implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {

    private KakaoOAuth2UserService kakaoOAuth2UserService;
//    private GoogleAuth2UserService googleAuth2UserService;
    private StringRedisTemplate redis;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        String registrationId = userRequest.getClientRegistration().getRegistrationId();

        OAuth2User oAuth2User;
        switch (registrationId)  {
            case "kakao" -> oAuth2User = kakaoOAuth2UserService.loadUser(userRequest);
//            case "google" -> oAuth2User = googleOAuth2UserService.loadUser(userRequest);
            default -> throw new IllegalStateException(registrationId + " 은(는) 지원하지 않는 방식입니다.");
        }
//
//        String role = extractRoleFromState();
        Map<String, Object> mapped = new HashMap<>(oAuth2User.getAttributes());
//        if(role != null) {
//            UserRole userRole = UserRole.valueOf(role);
//            mapped.put("role", role);
//            mapped.put("UserRole", userRole);
//        }

        return new DefaultOAuth2User(oAuth2User.getAuthorities(), mapped, "providerId");
    }

    private String extractRoleFromState() {
        HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();

        String state = request.getParameter("state");
        if(state == null) {
            return null;
        }

        String key = "oauth:state:" + state;
        String role = redis.opsForValue().get(key);

        if(role != null) {
            redis.delete(key);
        }

        return role;
    }
}
