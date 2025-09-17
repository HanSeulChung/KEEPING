package com.ssafy.keeping.global.client;

import com.ssafy.keeping.domain.user.finopenapi.SearchUserKeyRequestDto;
import com.ssafy.keeping.domain.user.finopenapi.SearchUserKeyResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

@Service
@RequiredArgsConstructor
public class FinOpenApiClient {

    private final WebClient finOpenApiWebClient;
    private final FinOpenApiProperties apiProps;

    public <TReq, TRes> TRes post(String path, TReq body, Class<TRes> resType) {
        return Mono.fromCallable(() -> {

            return finOpenApiWebClient.post()
                    .uri(path)
                    .bodyValue(body)
                    .retrieve()
                    .onStatus(HttpStatusCode::is4xxClientError, r -> r.bodyToMono(String.class)
                            .map(msg -> new IllegalArgumentException("finopenapi 4xx: " + msg)))
                    .onStatus(HttpStatusCode::is5xxServerError, r -> r.bodyToMono(String.class)
                            .map(msg -> new IllegalStateException("finopenapi 5xx: " + msg)))
                    .bodyToMono(resType)
                    .block();
        })    .subscribeOn(Schedulers.boundedElastic()) // 별도 스레드에서 실행
                .block();
    }

    // email 로 userKey 찾기
    public SearchUserKeyResponseDto searchUserKey(String email) {
        SearchUserKeyRequestDto requestDto = SearchUserKeyRequestDto.builder().userId(email).apiKey(apiProps.getApiKey()).build();
        return post(FinOpenApiPaths.MEMBER_SEARCH, requestDto, SearchUserKeyResponseDto.class);
    }

    // userkey 생성
    public
}
