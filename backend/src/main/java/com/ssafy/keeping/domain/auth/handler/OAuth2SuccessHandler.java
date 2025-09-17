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
        // role이 null인 경우 처리
        if (role == null) {
            System.out.println("[OAUTH] Role is null - redirecting to role selection");

            if (devFallback()) {
                // 개발 환경에서는 HTML 페이지로 응답 (JSON 대신)
                response.setContentType("text/html;charset=UTF-8");
                response.getWriter().write(createErrorHtmlPage(
                        "Role Selection Required",
                        "OAuth 로그인은 성공했지만 역할(role) 정보가 없습니다.",
                        "다시 로그인해주세요: <a href='/oauth-test'>OAuth 테스트 페이지</a>"
                ));
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

            TokenResponse tokenResponse = tokenService.issueTokens(userId, role);
            cookieUtil.addHttpOnlyRefreshCookie(response, tokenResponse.getRefreshToken(), Duration.ofDays(7));

            if (devFallback()) {
                // 개발 환경에서는 성공 페이지로 응답
                response.setContentType("text/html;charset=UTF-8");
                response.getWriter().write(createSuccessHtmlPage(
                        "로그인 성공",
                        "OAuth 로그인이 완료되었습니다.",
                        "사용자 ID: " + userId + "<br>역할: " + role + "<br>Refresh Token이 쿠키에 저장되었습니다.",
                        tokenResponse.getAccessToken()
                ));
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
                // 개발 환경에서는 회원가입 안내 페이지로 응답
                response.setContentType("text/html;charset=UTF-8");
                response.getWriter().write(createSignupHtmlPage(
                        "회원가입 필요",
                        "신규 사용자입니다. 회원가입을 진행해주세요.",
                        regSessionId,
                        role.toString()
                ));
                return;
            }

            // TODO: 프론트 주소로 변경
            response.sendRedirect("/otp/start?regSessionId=" + regSessionId);
        }

    }

    private String createErrorHtmlPage(String title, String message, String action) {
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <title>%s</title>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
                    .container { text-align: center; background: #f8f9fa; padding: 30px; border-radius: 10px; }
                    .error { color: #dc3545; }
                    .btn { display: inline-block; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 10px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1 class="error">❌ %s</h1>
                    <p>%s</p>
                    <p>%s</p>
                    <a href="/oauth-test" class="btn">OAuth 테스트 페이지로 이동</a>
                </div>
            </body>
            </html>
            """, title, title, message, action);
    }

    // OAuth2SuccessHandler.java의 createSuccessHtmlPage 메서드를 다음으로 교체

    private String createSuccessHtmlPage(String title, String message, String details, String accessToken) {
        return String.format("""
        <!DOCTYPE html>
        <html lang="ko">
        <head>
            <title>%s</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%);
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                }
                
                .container {
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(10px);
                    border-radius: 20px;
                    padding: 40px;
                    max-width: 600px;
                    width: 100%%;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                    text-align: center;
                    position: relative;
                    overflow: hidden;
                }
                
                .container::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 4px;
                    background: linear-gradient(90deg, #4CAF50, #45a049);
                }
                
                .success-icon {
                    font-size: 4rem;
                    margin-bottom: 20px;
                    animation: bounce 1s ease-in-out;
                }
                
                @keyframes bounce {
                    0%%, 20%%, 50%%, 80%%, 100%% { transform: translateY(0); }
                    40%% { transform: translateY(-10px); }
                    60%% { transform: translateY(-5px); }
                }
                
                h1 {
                    color: #2c3e50;
                    margin-bottom: 10px;
                    font-size: 2rem;
                    font-weight: 600;
                }
                
                .subtitle {
                    color: #7f8c8d;
                    margin-bottom: 30px;
                    font-size: 1.1rem;
                }
                
                .details {
                    background: #f8f9fa;
                    padding: 20px;
                    border-radius: 10px;
                    margin: 20px 0;
                    border-left: 4px solid #4CAF50;
                }
                
                .token-section {
                    margin: 30px 0;
                }
                
                .token-label {
                    font-weight: 600;
                    color: #2c3e50;
                    margin-bottom: 10px;
                    font-size: 1.1rem;
                }
                
                .token-container {
                    position: relative;
                    background: #f1f3f4;
                    border: 2px solid #e0e0e0;
                    border-radius: 10px;
                    padding: 15px;
                    margin: 10px 0;
                }
                
                .token-display {
                    font-family: 'Courier New', monospace;
                    font-size: 12px;
                    color: #333;
                    word-break: break-all;
                    line-height: 1.4;
                    background: transparent;
                    border: none;
                    width: 100%%;
                    resize: none;
                    outline: none;
                    height: 120px;
                    overflow-y: auto;
                }
                
                .copy-btn {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: #4CAF50;
                    color: white;
                    border: none;
                    padding: 8px 12px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 12px;
                    font-weight: 500;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                }
                
                .copy-btn:hover {
                    background: #45a049;
                    transform: translateY(-1px);
                    box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
                }
                
                .copy-btn.copied {
                    background: #2196F3;
                    animation: pulse 0.3s ease;
                }
                
                @keyframes pulse {
                    0%% { transform: scale(1); }
                    50%% { transform: scale(1.05); }
                    100%% { transform: scale(1); }
                }
                
                .action-buttons {
                    margin-top: 30px;
                    display: flex;
                    gap: 15px;
                    justify-content: center;
                    flex-wrap: wrap;
                }
                
                .btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 12px 24px;
                    text-decoration: none;
                    border-radius: 8px;
                    font-weight: 500;
                    font-size: 14px;
                    transition: all 0.2s ease;
                    min-width: 120px;
                    justify-content: center;
                }
                
                .btn-primary {
                    background: linear-gradient(45deg, #667eea, #764ba2);
                    color: white;
                }
                
                .btn-secondary {
                    background: #6c757d;
                    color: white;
                }
                
                .btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                }
                
                .usage-note {
                    background: #e3f2fd;
                    border: 1px solid #2196F3;
                    border-radius: 8px;
                    padding: 15px;
                    margin-top: 20px;
                    font-size: 14px;
                    color: #1976d2;
                }
                
                .toast {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: #4CAF50;
                    color: white;
                    padding: 12px 20px;
                    border-radius: 8px;
                    font-weight: 500;
                    transform: translateX(100%%);
                    transition: transform 0.3s ease;
                    z-index: 1000;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                }
                
                .toast.show {
                    transform: translateX(0);
                }
                
                @media (max-width: 600px) {
                    .container {
                        margin: 10px;
                        padding: 30px 20px;
                    }
                    
                    .action-buttons {
                        flex-direction: column;
                        align-items: center;
                    }
                    
                    .btn {
                        width: 100%%;
                        max-width: 300px;
                    }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="success-icon">🎉</div>
                <h1>카카오 로그인 성공!</h1>
                <p class="subtitle">JWT Access Token이 발급되었습니다</p>
                
                <div class="details">%s</div>
                
                <div class="token-section">
                    <div class="token-label">🔑 Access Token</div>
                    <div class="token-container">
                        <textarea class="token-display" readonly>%s</textarea>
                        <button class="copy-btn" onclick="copyToken()">
                            📋 복사
                        </button>
                    </div>
                </div>
                
                <div class="usage-note">
                    <strong>💡 사용법:</strong><br>
                    • 포스트맨에서 Authorization → Bearer Token에 위 토큰 붙여넣기<br>
                    • 또는 Headers에 <code>Authorization: Bearer &lt;토큰&gt;</code> 추가<br>
                    • 토큰 유효시간: 15분
                </div>
                
                <div class="action-buttons">
                    <a href="/auth/logout" class="btn btn-primary">
                        로그아웃
                    </a>
                </div>
            </div>
            
            <div class="toast" id="toast">토큰이 클립보드에 복사되었습니다! 📋</div>
            
            <script>
                // 토큰을 localStorage와 sessionStorage에 저장
                const token = '%s';
                localStorage.setItem('accessToken', token);
                sessionStorage.setItem('accessToken', token);
                console.log('✅ Access Token saved to storage');
                
                // 토큰 복사 함수
                function copyToken() {
                    const tokenDisplay = document.querySelector('.token-display');
                    const copyBtn = document.querySelector('.copy-btn');
                    const toast = document.getElementById('toast');
                    
                    // 토큰 선택 및 복사
                    tokenDisplay.select();
                    tokenDisplay.setSelectionRange(0, 99999); // 모바일 지원
                    
                    try {
                        document.execCommand('copy');
                        
                        // 버튼 상태 변경
                        copyBtn.textContent = '✅ 복사됨!';
                        copyBtn.classList.add('copied');
                        
                        // 토스트 메시지 표시
                        toast.classList.add('show');
                        
                        // 1.5초 후 원래 상태로 복원
                        setTimeout(() => {
                            copyBtn.textContent = '📋 복사';
                            copyBtn.classList.remove('copied');
                            toast.classList.remove('show');
                        }, 1500);
                        
                    } catch (err) {
                        console.error('복사 실패:', err);
                        copyBtn.textContent = '❌ 실패';
                        setTimeout(() => {
                            copyBtn.textContent = '📋 복사';
                        }, 1500);
                    }
                }
                
                // 현대적인 Clipboard API 지원 확인 및 사용
                if (navigator.clipboard) {
                    function copyToken() {
                        const token = '%s';
                        const copyBtn = document.querySelector('.copy-btn');
                        const toast = document.getElementById('toast');
                        
                        navigator.clipboard.writeText(token).then(() => {
                            copyBtn.textContent = '✅ 복사됨!';
                            copyBtn.classList.add('copied');
                            toast.classList.add('show');
                            
                            setTimeout(() => {
                                copyBtn.textContent = '📋 복사';
                                copyBtn.classList.remove('copied');
                                toast.classList.remove('show');
                            }, 1500);
                        }).catch(err => {
                            console.error('복사 실패:', err);
                            copyBtn.textContent = '❌ 실패';
                            setTimeout(() => {
                                copyBtn.textContent = '📋 복사';
                            }, 1500);
                        });
                    }
                }
                
                // 페이지 로드 시 애니메이션
                window.addEventListener('load', () => {
                    document.querySelector('.container').style.animation = 'fadeInUp 0.6s ease-out';
                });
                
                // fadeInUp 애니메이션 정의
                const style = document.createElement('style');
                style.textContent = `
                    @keyframes fadeInUp {
                        from {
                            opacity: 0;
                            transform: translateY(30px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                `;
                document.head.appendChild(style);
            </script>
        </body>
        </html>
        """, title, details, accessToken, accessToken, accessToken, accessToken);
    }

    // OAuth2SuccessHandler.java의 createSignupHtmlPage 메서드를 다음으로 교체

// OAuth2SuccessHandler.java의 createSignupHtmlPage 메서드 수정

    private String createSignupHtmlPage(String title, String message, String regSessionId, String role) {
        return String.format("""
        <!DOCTYPE html>
        <html lang="ko">
        <head>
            <title>%s</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    background: linear-gradient(135deg, #f093fb 0%%, #f5576c 100%%);
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                }
                
                .container {
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(10px);
                    border-radius: 20px;
                    padding: 40px;
                    max-width: 600px;
                    width: 100%%;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                    text-align: center;
                    position: relative;
                    overflow: hidden;
                }
                
                .container::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 4px;
                    background: linear-gradient(90deg, #ff9a9e, #fecfef);
                }
                
                .signup-icon {
                    font-size: 4rem;
                    margin-bottom: 20px;
                    animation: pulse 2s infinite;
                }
                
                @keyframes pulse {
                    0%% { transform: scale(1); }
                    50%% { transform: scale(1.05); }
                    100%% { transform: scale(1); }
                }
                
                h1 {
                    color: #2c3e50;
                    margin-bottom: 10px;
                    font-size: 2rem;
                    font-weight: 600;
                }
                
                .subtitle {
                    color: #7f8c8d;
                    margin-bottom: 30px;
                    font-size: 1.1rem;
                }
                
                .info-card {
                    background: #fff3cd;
                    border: 1px solid #ffeaa7;
                    border-radius: 12px;
                    padding: 20px;
                    margin: 20px 0;
                    text-align: left;
                }
                
                .info-item {
                    margin: 10px 0;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                
                .info-label {
                    font-weight: 600;
                    color: #856404;
                    min-width: 80px;
                }
                
                .info-value {
                    font-family: 'Courier New', monospace;
                    background: rgba(255, 255, 255, 0.7);
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 14px;
                }
                
                .steps {
                    background: #e3f2fd;
                    border: 1px solid #2196F3;
                    border-radius: 12px;
                    padding: 20px;
                    margin: 20px 0;
                    text-align: left;
                }
                
                .step {
                    margin: 15px 0;
                    padding: 10px;
                    border-left: 3px solid #2196F3;
                    padding-left: 15px;
                }
                
                .step-number {
                    display: inline-block;
                    background: #2196F3;
                    color: white;
                    width: 24px;
                    height: 24px;
                    border-radius: 50%%;
                    text-align: center;
                    line-height: 24px;
                    font-size: 12px;
                    font-weight: bold;
                    margin-right: 10px;
                }
                
                .btn {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 15px 30px;
                    font-size: 16px;
                    font-weight: 600;
                    text-decoration: none;
                    border: none;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    min-width: 200px;
                    margin: 10px;
                }
                
                .btn-warning {
                    background: linear-gradient(45deg, #f093fb, #f5576c);
                    color: white;
                }
                
                .btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
                }
                
                .btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    transform: none;
                }
                
                .loading {
                    display: none;
                    margin: 20px 0;
                }
                
                .spinner {
                    border: 3px solid #f3f3f3;
                    border-top: 3px solid #667eea;
                    border-radius: 50%%;
                    width: 30px;
                    height: 30px;
                    animation: spin 1s linear infinite;
                    margin: 0 auto;
                }
                
                @keyframes spin {
                    0%% { transform: rotate(0deg); }
                    100%% { transform: rotate(360deg); }
                }
                
                .modal {
                    display: none;
                    position: fixed;
                    z-index: 1000;
                    left: 0;
                    top: 0;
                    width: 100%%;
                    height: 100%%;
                    background-color: rgba(0, 0, 0, 0.5);
                    backdrop-filter: blur(5px);
                }
                
                .modal-content {
                    background-color: white;
                    margin: 15%% auto;
                    padding: 30px;
                    border-radius: 15px;
                    width: 90%%;
                    max-width: 400px;
                    text-align: center;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                }
                
                .modal-buttons {
                    margin-top: 20px;
                    display: flex;
                    gap: 10px;
                    justify-content: center;
                }
                
                .btn-small {
                    padding: 10px 20px;
                    font-size: 14px;
                    min-width: 100px;
                }
                
                .btn-primary {
                    background: linear-gradient(45deg, #667eea, #764ba2);
                    color: white;
                }
                
                .btn-secondary {
                    background: #6c757d;
                    color: white;
                }
                
                @media (max-width: 600px) {
                    .container {
                        margin: 10px;
                        padding: 30px 20px;
                    }
                    
                    .modal-content {
                        margin: 30%% auto;
                        padding: 20px;
                    }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="signup-icon">📝</div>
                <h1>회원가입이 필요합니다</h1>
                <p class="subtitle">%s</p>
                
                <div class="info-card">
                    <div class="info-item">
                        <span class="info-label">👤 역할:</span>
                        <span class="info-value">%s</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">🆔 세션:</span>
                        <span class="info-value">%s</span>
                    </div>
                </div>
                
                <div class="steps">
                    <h3 style="color: #1976d2; margin-bottom: 15px;">📋 회원가입 진행 방법</h3>
                    <div class="step">
                        <span class="step-number">1</span>
                        포스트맨에서 <code>POST /otp/request</code> 호출
                       <p>{
                                     "name": "이름",
                                     "phoneNumber": "핸드폰번호",
                                     "birth": "yyyy-mm-dd",
                                     "genderDigit" : "주민번호 뒷자리 첫번째 숫자",
                                     "regSessionId" : "regSessionId"
                                   }
                      </p>
                    </div>
                    <div class="step">
                        <span class="step-number">2</span>
                        받은 OTP 코드로 <code>POST /otp/verify</code> 호출
                        <p>
                        {
                                  "regSessionId": "regSessionId",
                                  "code": "/otp/request의 responsebody의 number"
                                }
                        </p>
                    </div>
                    <div class="step">
                        <span class="step-number">3</span>
                        아래 "회원가입 완료" 버튼 클릭
                    </div>
                </div>
                
                <div class="loading" id="loading">
                    <div class="spinner"></div>
                    <p>로그인 처리 중...</p>
                </div>
                
                <button class="btn btn-warning" onclick="completeSignup()">
                    ✅ 회원가입 완료
                </button>
            </div>
            
            <!-- OTP 확인 모달 -->
            <div id="otpModal" class="modal">
                <div class="modal-content">
                    <h3>📱 OTP 인증 확인</h3>
                    <p style="margin: 20px 0; color: #666;">
                        포스트맨에서 OTP 인증을 완료하셨나요?<br>
                        <small>(/otp/request → /otp/verify 완료)</small>
                    </p>
                    <div class="modal-buttons">
                        <button class="btn btn-primary btn-small" onclick="confirmOtp(true)">
                            ✅ 완료했음
                        </button>
                        <button class="btn btn-secondary btn-small" onclick="confirmOtp(false)">
                            ❌ 아직 안함
                        </button>
                    </div>
                </div>
            </div>
            
            <script>
                const regSessionId = '%s';
                const role = '%s';
                
                function completeSignup() {
                    document.getElementById('otpModal').style.display = 'block';
                }
                
                function confirmOtp(isCompleted) {
                    const modal = document.getElementById('otpModal');
                    modal.style.display = 'none';
                    
                    if (isCompleted) {
                        processLogin();
                    } else {
                        alert('OTP 인증을 먼저 완료해주세요!\\n\\n1. POST /otp/request (regSessionId 포함)\\n2. POST /otp/verify (OTP 코드 입력)');
                    }
                }
                
                async function processLogin() {
                    const loading = document.getElementById('loading');
                    loading.style.display = 'block';
                    
                    try {
                        const signupEndpoint = role.toLowerCase() === 'customer' ? '/auth/signup/customer' : '/auth/signup/owner';
                        
                        const response = await fetch(signupEndpoint, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                regSessionId: regSessionId
                            })
                        });
                        
                        if (response.ok) {
                            const result = await response.json();
                            
                            if (result.success) {
                                const accessToken = result.data.token.accessToken;
                                const userId = result.data.user.id || result.data.user.customerId || result.data.user.ownerId;
                                
                                showSuccessPage(accessToken, userId, role);
                            } else {
                                throw new Error(result.message || '회원가입 처리 실패');
                            }
                        } else {
                            const errorData = await response.json();
                            throw new Error(errorData.message || `HTTP ${response.status}`);
                        }
                        
                    } catch (error) {
                        loading.style.display = 'none';
                        alert(`회원가입 처리 중 오류가 발생했습니다:\\n${error.message}\\n\\nOTP 인증이 완료되었는지 확인해주세요.`);
                        console.error('Signup error:', error);
                    }
                }
                
                function showSuccessPage(accessToken, userId, role) {
                    document.body.innerHTML = `
                        <div class="container" style="background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px);">
                            <div style="font-size: 4rem; margin-bottom: 20px;">🎉</div>
                            <h1 style="color: #2c3e50; margin-bottom: 10px;">회원가입 및 로그인 완료!</h1>
                            <p style="color: #7f8c8d; margin-bottom: 30px; font-size: 1.1rem;">카카오 계정으로 회원가입과 로그인이 완료되었습니다</p>
                            
                            <div style="background: #d4edda; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #4CAF50;">
                                사용자 ID: ${userId}<br>
                                역할: ${role}<br>
                                환영합니다! 🎉
                            </div>
                            
                            <div style="margin: 30px 0;">
                                <div style="font-weight: 600; color: #2c3e50; margin-bottom: 10px; font-size: 1.1rem;">🔑 Access Token</div>
                                <div style="position: relative; background: #f1f3f4; border: 2px solid #e0e0e0; border-radius: 10px; padding: 15px; margin: 10px 0;">
                                    <textarea readonly style="font-family: 'Courier New', monospace; font-size: 12px; color: #333; word-break: break-all; line-height: 1.4; background: transparent; border: none; width: 100%%; resize: none; outline: none; height: 120px; overflow-y: auto;">${accessToken}</textarea>
                                    <button onclick="copyToken('${accessToken}')" style="position: absolute; top: 10px; right: 10px; background: #4CAF50; color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 12px;">📋 복사</button>
                                </div>
                            </div>
                            
                            <div style="background: #e3f2fd; border: 1px solid #2196F3; border-radius: 8px; padding: 15px; margin-top: 20px; font-size: 14px; color: #1976d2;">
                                <strong>💡 사용법:</strong><br>
                                • 포스트맨에서 Authorization → Bearer Token에 위 토큰 붙여넣기<br>
                                • 또는 Headers에 <code>Authorization: Bearer &lt;토큰&gt;</code> 추가<br>
                                • 토큰 유효시간: 15분
                            </div>
                        </div>
                        
                        <div style="position: fixed; top: 20px; right: 20px; background: #4CAF50; color: white; padding: 12px 20px; border-radius: 8px; font-weight: 500; transform: translateX(100%%); transition: transform 0.3s ease; z-index: 1000; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);" id="toast">토큰이 클립보드에 복사되었습니다! 📋</div>
                    `;
                    
                    localStorage.setItem('accessToken', accessToken);
                    sessionStorage.setItem('accessToken', accessToken);
                    console.log('✅ Access Token saved to storage');
                }
                
                function copyToken(token) {
                    if (navigator.clipboard) {
                        navigator.clipboard.writeText(token).then(() => {
                            const toast = document.getElementById('toast');
                            toast.style.transform = 'translateX(0)';
                            setTimeout(() => {
                                toast.style.transform = 'translateX(100%%)';
                            }, 2000);
                        });
                    }
                }
                
                // 모달 외부 클릭 시 닫기
                window.onclick = function(event) {
                    const modal = document.getElementById('otpModal');
                    if (event.target === modal) {
                        modal.style.display = 'none';
                    }
                }
            </script>
        </body>
        </html>
        """, title, message, role, regSessionId, regSessionId, role);
    }

    private boolean devFallback() {
        return feBaseUrl == null || feBaseUrl.isBlank();
    }

}




