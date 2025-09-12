package com.ssafy.keeping.domain.auth.controller;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/auth")
public class AuthController {

    // 로그인
    @GetMapping("/{role}/{provider}/login")
    public void login(@PathVariable String role, @PathVariable String provider, HttpServletResponse response) throws IOException {
        response.sendRedirect("/oauth2/authorization/" + provider + "?role=" + role);
    }
}
