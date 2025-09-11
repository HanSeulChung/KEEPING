package com.ssafy.keeping.domain.customer.controller;

import com.ssafy.keeping.domain.customer.dto.CustomerRegisterRequestDto;
import com.ssafy.keeping.domain.customer.dto.CustomerRegisterResponseDto;
import com.ssafy.keeping.domain.customer.dto.PrefillResponseDto;
import com.ssafy.keeping.domain.customer.service.CustomerService;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    // 회원가입
    @PostMapping("/")
    public ResponseEntity<CustomerRegisterResponseDto> register(@RequestBody CustomerRegisterRequestDto dto) {
        CustomerRegisterResponseDto responseDto = customerService.RegisterCustomer(dto);

        return ResponseEntity.status(201).body(responseDto);
    }

    // 회원가입 시 정보 미리 채워두기
    @GetMapping("/prefill")
    public ResponseEntity<PrefillResponseDto> prefillInfo(@RequestParam @NotBlank String regSessionId) {
        PrefillResponseDto responseDto = customerService.prefillInfo(regSessionId);

        return ResponseEntity.ok(responseDto);
    }

}
