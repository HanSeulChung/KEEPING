package com.ssafy.keeping.domain.user.customer.controller;

import com.ssafy.keeping.domain.user.customer.service.CustomerService;
import com.ssafy.keeping.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    // test
    @GetMapping
    public ResponseEntity<ApiResponse<String>> testCumstomers() {
        return ResponseEntity.ok().body(ApiResponse.success("Spring Security 정상 작동", HttpStatus.OK.value(), "good"));
    }

    // 회원가입
//    @PostMapping("/")
//    public ResponseEntity<CustomerRegisterResponseDto> register(@RequestBody CustomerRegisterRequestDto dto) {
//        CustomerRegisterResponseDto responseDto = customerService.RegisterCustomer(dto);
//
//        return ResponseEntity.status(201).body(responseDto);
//    }



}
