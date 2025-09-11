package com.ssafy.keeping.domain.otp.adapter;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "sms")
public class SmsProperties {
    String apiKey;
    String apiSecretKey;
    String sendNumber;
    String baseUrl;
}
