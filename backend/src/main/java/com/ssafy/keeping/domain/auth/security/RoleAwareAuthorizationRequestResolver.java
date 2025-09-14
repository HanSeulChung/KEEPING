package com.ssafy.keeping.domain.auth.security;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;
import org.springframework.security.oauth2.core.endpoint.OAuth2ParameterNames;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RequiredArgsConstructor
public class RoleAwareAuthorizationRequestResolver implements OAuth2AuthorizationRequestResolver {


    private final StringRedisTemplate redis;
    private final ClientRegistrationRepository repo;
    private final String authorizationRequestBaseUri;

    private DefaultOAuth2AuthorizationRequestResolver delegate() {
        return new DefaultOAuth2AuthorizationRequestResolver(repo, authorizationRequestBaseUri);
    }

    @Override
    public OAuth2AuthorizationRequest resolve(HttpServletRequest request) {
        OAuth2AuthorizationRequest base = delegate().resolve(request);
        return rememberRole(request, base);
    }

    @Override
    public OAuth2AuthorizationRequest resolve(HttpServletRequest request, String clientRegistrationId) {
        OAuth2AuthorizationRequest base = delegate().resolve(request, clientRegistrationId);
        return rememberRole(request, base);
    }

    private OAuth2AuthorizationRequest rememberRole(HttpServletRequest request, OAuth2AuthorizationRequest base) {
        if (base == null) return null;

        String role = request.getParameter("role");
        if (role != null && base.getState() != null) {
            String key = "oauth:state:" + base.getState();
            redis.opsForValue().set(key, role, Duration.ofMinutes(5));
        }

        // 외부 공급자에게 role 안보냄
        return base;
    }

//    private final StringRedisTemplate redis;
//    private final ClientRegistrationRepository repo;
//    private final String authorizationRequestBaseUri;
//
//    @Override
//    public OAuth2AuthorizationRequest resolve(HttpServletRequest request) {
//        String uri = request.getRequestURI();
//        if(!uri.startsWith(authorizationRequestBaseUri)) {
//            return null;
//        }
//
//        String provider = uri.substring(authorizationRequestBaseUri.length() + 1);
//        return resolve(request, provider);
//    }
//
//    @Override
//    public OAuth2AuthorizationRequest resolve(HttpServletRequest request, String clientRegistrationId) {
//        ClientRegistration clientRegistration = repo.findByRegistrationId(clientRegistrationId);
//        if(clientRegistration == null) {
//            return null;
//        }
//
//        String state = UUID.randomUUID().toString();
//
//        // role
//        String role = request.getParameter("role");
//        if(role != null) {
//            redis.opsForValue().set("oauth:state:" + state, role, Duration.ofMinutes(5));
//        }
//
//        // 기본 authorize URI 구성
//        Map<String, Object> additionalParameters = new HashMap<>();
//        if (role != null) {
//            additionalParameters.put("role", role);
//        }
//
//        return OAuth2AuthorizationRequest.authorizationCode()
//                .authorizationRequestUri(clientRegistration.getProviderDetails().getAuthorizationUri())
//                .clientId(clientRegistration.getClientId())
//                .redirectUri(clientRegistration.getRedirectUri())
//                .scopes(clientRegistration.getScopes())
//                .state(state)
//                .additionalParameters(additionalParameters)
//                .attributes(attrs -> {
//                    attrs.put(OAuth2ParameterNames.REGISTRATION_ID, clientRegistrationId);
//                })
//                .build();
//    }
}
