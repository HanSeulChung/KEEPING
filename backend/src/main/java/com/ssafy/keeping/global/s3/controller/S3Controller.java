package com.ssafy.keeping.global.s3.controller;

import com.ssafy.keeping.global.s3.service.S3Service;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/s3")
@RequiredArgsConstructor
public class S3Controller {

    private final S3Service s3Service;

    @PostMapping("/upload")
    public String uploadFile(@RequestParam("file") MultipartFile file) {
        String imgUrl = null;
        try {
            imgUrl = s3Service.uploadImage(file);

            return "File upload Successfully ~! " + imgUrl;
        } catch (IOException e) {
            e.printStackTrace();
            return "File upload Failed :<";
        }
    }
}
