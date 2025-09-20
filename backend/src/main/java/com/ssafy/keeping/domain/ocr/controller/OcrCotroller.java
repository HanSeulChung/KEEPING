package com.ssafy.keeping.domain.ocr.controller;

import com.ssafy.keeping.domain.ocr.dto.BizLicenseOcrResponse;

import com.ssafy.keeping.domain.ocr.service.BizLicenseOcrService;
import com.ssafy.keeping.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;

@Controller
@RequiredArgsConstructor
@RequestMapping("/ocr")
public class OcrCotroller {

    private final BizLicenseOcrService bizLicenseOcrService;

    @PostMapping(value = "/biz-license" , consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<BizLicenseOcrResponse>> recognizeBizLicense(
            @RequestPart("file")MultipartFile file
    ) {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("이미지 파일이 필요합니다.", 400));
        }

        // 이미지 타입 제한
        String ct = file.getContentType();
        if (ct == null || !(ct.equals("image/jpeg") || ct.equals("image/png") || ct.equals("image/jpg"))) {
            return ResponseEntity.badRequest().body(ApiResponse.error("지원하지 않는 파일 형식입니다. (jpg, jpeg, png)", 400));
        }
        // 용량 제한(예: 10MB)
        long maxBytes = 10L * 1024 * 1024;
        if (file.getSize() > maxBytes) {
            return ResponseEntity.badRequest().body(ApiResponse.error("파일 용량이 너무 큽니다. (최대 10MB)", 400));
        }

        BizLicenseOcrResponse result = bizLicenseOcrService.recognize(file);

        return ResponseEntity.ok(ApiResponse.success("OK", 200, result));
    }
}
