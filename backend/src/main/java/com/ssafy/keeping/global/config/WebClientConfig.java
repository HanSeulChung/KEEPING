package com.ssafy.keeping.global.config;

import com.ssafy.keeping.global.client.FinOpenApiProperties;
import io.netty.channel.ChannelOption;
import io.netty.handler.timeout.ReadTimeoutHandler;
import io.netty.handler.timeout.WriteTimeoutHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;

import java.util.concurrent.TimeUnit;

@Configuration
public class WebClientConfig {

    @Bean
    public WebClient finOpenApiWebClient(FinOpenApiProperties props) {
        HttpClient httpClient = HttpClient.create()
                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, props.getTimeOutMs().getConnect())
                .doOnConnected(conn ->
                        conn.addHandlerLast(new ReadTimeoutHandler(props.getTimeOutMs().getRead(), TimeUnit.MILLISECONDS))
                                .addHandlerLast(new WriteTimeoutHandler(props.getTimeOutMs().getRead(), TimeUnit.MILLISECONDS))
                );
        return WebClient.builder()
                .baseUrl(props.getBaseUrl())
                .build();
    }

}
