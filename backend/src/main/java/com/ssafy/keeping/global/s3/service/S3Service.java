package com.ssafy.keeping.global.s3.service;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.PutObjectRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.parameters.P;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class S3Service {

    private final AmazonS3 amazonS3;

    @Value("${cloud.aws.s3.bucket}")
    private String bucketName;

    public String uploadImage(MultipartFile image) throws IOException {
        String fileName = UUID.randomUUID() + "_" + image.getOriginalFilename();

        // 메타데이터 설정
        ObjectMetadata metadata = new ObjectMetadata();
        metadata.setContentType(image.getContentType());
        metadata.setContentLength(image.getSize());
//
        // S3에 파일 업로드 요청
        PutObjectRequest putObjectRequest = new PutObjectRequest(bucketName, fileName, image.getInputStream(), metadata);

        amazonS3.putObject(putObjectRequest);

        return getPublicUrl(fileName);

    }


    // content type 추정
    public String getContentTypeFromFileName(String fileName) {
        String extension = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();

        switch (extension) {
            case "jpg":
            case "jpeg":
                return "image/jpeg";
            case "png":
                return "image/png";
            case "gif":
                return "image/gif";
            case "webp":
                return "image/webp";
            default:
                return "image/jpeg"; // 기본값
        }
    }


    // fileName 추출
    public String getFileNameFromUrl(String imgUrl) {
        String fileName = imgUrl.substring(imgUrl.lastIndexOf('/') + 1);

        // 쿼리 파라미터가 있다면 제거
        int queryIndex = fileName.indexOf('?');
        if (queryIndex != -1) {
            fileName = fileName.substring(0, queryIndex);
        }

        // 확장자가 없다면 기본값 설정
        if (!fileName.contains(".")) {
            fileName += ".jpg";
        }

        return fileName;
    }

    public String getPublicUrl(String fileName) {
        return String.format("https://%s.s3.%s.amazonaws.com/%s", bucketName, amazonS3.getRegionName(), fileName);
    }
}
