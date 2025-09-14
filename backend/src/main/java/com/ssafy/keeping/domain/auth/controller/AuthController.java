package com.ssafy.keeping.domain.auth.controller;

import com.ssafy.keeping.domain.auth.Util.CookieUtil;
import com.ssafy.keeping.domain.auth.enums.UserRole;
import com.ssafy.keeping.domain.auth.service.AuthService;
import com.ssafy.keeping.domain.auth.service.TokenResponse;
import com.ssafy.keeping.domain.auth.service.TokenService;
import com.ssafy.keeping.domain.customer.dto.CustomerRegisterRequest;
import com.ssafy.keeping.domain.customer.dto.CustomerRegisterResponse;
import com.ssafy.keeping.domain.customer.dto.PrefillResponse;
import com.ssafy.keeping.domain.customer.dto.SignupCustomerResponse;
import com.ssafy.keeping.domain.customer.service.CustomerService;
import com.ssafy.keeping.global.response.ApiResponse;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.Duration;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final TokenService tokenService;
    private final CustomerService customerService;
    private final CookieUtil cookieUtil;

    // 로그인
    @GetMapping("/{role}/{provider}/login")
    public void login(@PathVariable String role, @PathVariable String provider, HttpServletResponse response) throws IOException {
        response.sendRedirect("/oauth2/authorization/" + provider + "?role=" + role);
    }

    // 회원가입 시 정보 미리 채워두기
    @GetMapping("/prefill")
    public ResponseEntity<PrefillResponse> prefillInfo(@RequestParam @NotBlank String regSessionId) {
        PrefillResponse responseDto = authService.prefillInfo(regSessionId);

        return ResponseEntity.ok(responseDto);
    }

    @PostMapping("/signup/customer")
    public ResponseEntity<ApiResponse<SignupCustomerResponse>> completeCustomer(@RequestBody @Valid CustomerRegisterRequest dto,
                                                                                HttpServletResponse httpResponse) {
        CustomerRegisterResponse responseDto =  customerService.RegisterCustomer(dto);

        // 토큰 발급 및 쿠키에 저장
        SignupCustomerResponse response = authService.signUpTokenForCustomer(responseDto, httpResponse);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("회원가입이 완료되었습니다", HttpStatus.CREATED, response));
    }


}
