package com.ssafy.keeping.domain.auth.controller;

import com.ssafy.keeping.domain.auth.service.AuthService;
import com.ssafy.keeping.domain.customer.dto.CustomerRegisterRequest;
import com.ssafy.keeping.domain.customer.dto.CustomerRegisterResponse;
import com.ssafy.keeping.domain.customer.dto.SignupCustomerResponse;
import com.ssafy.keeping.domain.customer.service.CustomerService;
import com.ssafy.keeping.domain.owner.dto.OwnerRegisterRequest;
import com.ssafy.keeping.domain.owner.dto.OwnerRegisterResponse;
import com.ssafy.keeping.domain.owner.dto.SignupOwnerResponse;
import com.ssafy.keeping.domain.owner.service.OwnerService;
import com.ssafy.keeping.global.response.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.Duration;
import java.util.UUID;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final StringRedisTemplate redis;
    private final AuthService authService;
    private final CustomerService customerService;
    private final OwnerService ownerService;

    @GetMapping("/kakao/customer")
    public void kakaoLoginAsCustomer(HttpServletRequest request, HttpServletResponse response) throws IOException {
        // 세션에 role 저장
        request.getSession().setAttribute("oauth_role", "CUSTOMER");
        System.out.println("[AUTH CONTROLLER] Saved role=CUSTOMER to session: " + request.getSession().getId());
        response.sendRedirect("/oauth2/authorization/kakao");
    }

    @GetMapping("/kakao/owner")
    public void kakaoLoginAsOwner(HttpServletRequest request,HttpServletResponse response) throws IOException {
        request.getSession().setAttribute("oauth_role", "OWNER");
        System.out.println("[AUTH CONTROLLER] Saved role=OWNER to session: " + request.getSession().getId());
        response.sendRedirect("/oauth2/authorization/kakao");
    }


    @PostMapping("/signup/customer")
    public ResponseEntity<ApiResponse<SignupCustomerResponse>> completeCustomer(
            @RequestBody @Valid CustomerRegisterRequest dto,
            HttpServletResponse httpResponse
    ) {
        CustomerRegisterResponse response = customerService.RegisterCustomer(dto);
        SignupCustomerResponse signUpResponse = authService.signUpTokenForCustomer(response, httpResponse);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("회원가입이 완료되었습니다", HttpStatus.CREATED.value(), signUpResponse));
    }

    @PostMapping("/signup/owner")
    public ResponseEntity<ApiResponse<SignupOwnerResponse>> completeOwner(
            @RequestBody @Valid OwnerRegisterRequest dto,
            HttpServletResponse httpResponse
    ) {
        OwnerRegisterResponse response = ownerService.RegisterOwner(dto);
        SignupOwnerResponse signUpResponse = authService.signUpTokenForOwner(response, httpResponse);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("회원가입이 완료되었습니다", HttpStatus.CREATED.value(), signUpResponse));
    }

    @GetMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> userLogout() {
        return null;
    }


    @GetMapping("/select-role")
    public String selectRole() {
        return """
                <html>
                <head>
                    <title>역할 선택</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 50px; }
                        .button { 
                            display: inline-block; 
                            padding: 15px 30px; 
                            margin: 10px; 
                            background-color: #007bff; 
                            color: white; 
                            text-decoration: none; 
                            border-radius: 5px; 
                        }
                        .button:hover { background-color: #0056b3; }
                    </style>
                </head>
                <body>
                    <h2>카카오 로그인 - 역할을 선택하세요</h2>
                    <p>아래 버튼 중 하나를 클릭하여 로그인하세요:</p>
                    
                    <a href="/auth/kakao/customer" class="button">🛒 고객으로 로그인</a>
                    <br><br>
                    <a href="/auth/kakao/owner" class="button">🏪 점주로 로그인</a>
                    
                    <hr>
                    <h3>디버깅 정보:</h3>
                    <p><a href="/auth/debug/redis">Redis 상태 확인</a></p>
                </body>
                </html>
                """;
    }

    @GetMapping("/debug/redis")
    public String debugRedis() {
        StringBuilder sb = new StringBuilder();
        sb.append("<h3>Redis 전체 Keys:</h3>");

        try {
            // 모든 키 조회
            var allKeys = redis.keys("*");
            if (allKeys.isEmpty()) {
                sb.append("<p>Redis에 저장된 키가 없습니다.</p>");
            } else {
                sb.append("<p>총 ").append(allKeys.size()).append("개의 키가 있습니다.</p>");

                // 키를 패턴별로 분류해서 보여주기
                var oauthKeys = allKeys.stream().filter(key -> key.startsWith("oauth:")).toList();
                var signupKeys = allKeys.stream().filter(key -> key.startsWith("signup:")).toList();
                var otpKeys = allKeys.stream().filter(key -> key.startsWith("otp:")).toList();
                var otherKeys = allKeys.stream().filter(key ->
                        !key.startsWith("oauth:") &&
                                !key.startsWith("signup:") &&
                                !key.startsWith("otp:")
                ).toList();

                // OAuth 관련 키들
                if (!oauthKeys.isEmpty()) {
                    sb.append("<h4>OAuth State Keys:</h4>");
                    for (String key : oauthKeys) {
                        String value = redis.opsForValue().get(key);
                        sb.append("<p><strong>").append(key).append("</strong> = ").append(value).append("</p>");
                    }
                }

                // 회원가입 관련 키들
                if (!signupKeys.isEmpty()) {
                    sb.append("<h4>Signup Info Keys:</h4>");
                    for (String key : signupKeys) {
                        String value = redis.opsForValue().get(key);
                        sb.append("<div style='border: 1px solid #ccc; margin: 10px; padding: 10px;'>");
                        sb.append("<strong>").append(key).append("</strong><br>");
                        sb.append("<pre>").append(value).append("</pre>");
                        sb.append("</div>");
                    }
                }

                // OTP 관련 키들
                if (!otpKeys.isEmpty()) {
                    sb.append("<h4>OTP Keys:</h4>");
                    for (String key : otpKeys) {
                        String value = redis.opsForValue().get(key);
                        sb.append("<p><strong>").append(key).append("</strong> = ").append(value).append("</p>");
                    }
                }

                // 기타 키들
                if (!otherKeys.isEmpty()) {
                    sb.append("<h4>Other Keys:</h4>");
                    for (String key : otherKeys) {
                        String value = redis.opsForValue().get(key);
                        sb.append("<p><strong>").append(key).append("</strong> = ").append(value).append("</p>");
                    }
                }
            }
        } catch (Exception e) {
            sb.append("<p>Error: ").append(e.getMessage()).append("</p>");
        }

        sb.append("<hr>");
        sb.append("<p><a href='/auth/debug/clear-redis'>OAuth keys 삭제</a></p>");
        sb.append("<p><a href='/auth/select-role'>Back to role selection</a></p>");

        return sb.toString();
    }

    @GetMapping("/debug/clear-redis")
    public String clearRedis() {
        try {
            var keys = redis.keys("oauth:state:*");
            if (!keys.isEmpty()) {
                redis.delete(keys);
            }
            return "<p>OAuth state keys cleared!</p><a href='/auth/select-role'>Back to role selection</a>";
        } catch (Exception e) {
            return "<p>Error: " + e.getMessage() + "</p>";
        }
    }
}
