package com.ssafy.keeping.domain.auth.Util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class AuthUtil {

    @Value("${spring.security.oauth2.client.registration.kakao.client}")
    private String kakaoClient;

    @Value("${spring.security.oauth2.client.registration.kakao.redirect")
    private String redirect;
}
