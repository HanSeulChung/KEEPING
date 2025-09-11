package com.ssafy.keeping.domain.otp.adapter;

import net.nurigo.sdk.NurigoApp;
import net.nurigo.sdk.message.service.DefaultMessageService;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(SmsProperties.class)
public class SmsConfig {

    @Bean
    public DefaultMessageService messageService(SmsProperties props) {
        return NurigoApp.INSTANCE.initialize(props.apiKey, props.apiSecretKey, props.baseUrl);
    }
}
