package com.ssafy.keeping.domain.auth.service;

import com.ssafy.keeping.domain.auth.Util.AuthUtil;
import com.ssafy.keeping.global.exception.CustomException;
import com.ssafy.keeping.global.exception.constants.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Service
@RequiredArgsConstructor
public class KakaoService {

    private final RestTemplate restTemplate;
    private final AuthUtil authUtil;

    public boolean kakaoLogout() {
        try {
            System.out.println("카카오 로그아웃 시작");

            // 설정값들 출력하여 확인
            System.out.println("logout URL: " + authUtil.getLogout());
            System.out.println("client_id: " + authUtil.getKakaoClient());
            System.out.println("logout_redirect_uri: " + authUtil.getLogoutRedirect());

            String logoutUrl = authUtil.getLogout() + "?client_id=" + authUtil.getKakaoClient()
                    + "&logout_redirect_uri=" + authUtil.getLogoutRedirect();

            System.out.println("최종 로그아웃 URL: " + logoutUrl);

            ResponseEntity<String> response = restTemplate.getForEntity(logoutUrl, String.class);

            System.out.println("응답 상태 코드: " + response.getStatusCode());
            System.out.println("응답 본문: " + response.getBody());

            if (response.getStatusCode() == HttpStatus.OK ||
                    response.getStatusCode() == HttpStatus.FOUND) {
                log.info("카카오 로그아웃 URL 호출 성공");
                return true;
            }
        } catch (Exception e) {
            System.out.println("예외 발생: " + e.getClass().getSimpleName());
            System.out.println("예외 메시지: " + e.getMessage());
            // 카카오 로그아웃 실패 시 예외를 던지지 않고 false 반환
            log.warn("카카오 로그아웃 실패: {}", e.getMessage());
            return false;
        }
        return false;
    }

    /**
     * 카카오 로그아웃 URL 생성
     */
    public String buildKakaoLogoutUrl() {
        return "https://kauth.kakao.com/oauth/logout"
                + "?client_id=" + authUtil.getKakaoClient()
                + "&logout_redirect_uri=" + authUtil.getLogoutRedirect();
    }
}
