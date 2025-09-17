package com.ssafy.keeping.global.client;

import com.ssafy.keeping.domain.charge.dto.ssafyapi.request.SsafyApiHeaderDto;
import com.ssafy.keeping.domain.charge.service.SsafyFinanceApiService;
import com.ssafy.keeping.domain.user.finopenapi.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

@Service
@RequiredArgsConstructor
public class FinOpenApiClient {

    private final WebClient finOpenApiWebClient;
    private final SsafyFinanceApiService ssafyFinanceApiService;
    private final FinOpenApiProperties apiProps;

    private final Long TRANSACTION_BALANCE = 100000000L;

    @Value("${ssafy.finance.value.account-type-unique-no}")
    private String accountTypeUniqueNo;

    @Value("${ssafy.finance.value.card-unique-no")
    private String cardUniqueNo;

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
    public InsertMemberResponseDto insertMember(String email) {
        InsertMemberRequestDto requestDto = InsertMemberRequestDto.builder().userId(email).apiKey(apiProps.getApiKey()).build();
        return post(FinOpenApiPaths.INSERT_MEMBER, requestDto, InsertMemberResponseDto.class);
    }

    // 계좌 생성
    public CreateAccountResponse createAccount(String userKey) {
        // TODO: 환경변수
        String apiName = "createDemandDepositAccount";

        SsafyApiHeaderDto header = ssafyFinanceApiService.createCommonHeader(userKey, apiName);

        CreateAccountRequest request = CreateAccountRequest.builder()
                .header(header).accountTypeUniqueNo(accountTypeUniqueNo).build();

        return post(FinOpenApiPaths.CREATE_ACCOUNT, request, CreateAccountResponse.class);
    }

    // card 생성
    public IssueCardResponse issueCard(String userKey, String withdrawlAccountNo) {
        String apiName = "createCreditCard";

        SsafyApiHeaderDto header = ssafyFinanceApiService.createCommonHeader(userKey, apiName);

        // 출금일은 1일로 고정
        IssueCardRequest request = IssueCardRequest.builder()
                .cardUniqueNo(cardUniqueNo).withdrawlAccountNo(withdrawlAccountNo).build();

        return post(FinOpenApiPaths.ISSUE_CARD, request, IssueCardResponse.class);
    }

    // 계좌 입금
    public AccountDepositResponse accountDeposit(String userKey, String accountNo) {
        String apiName = "updateDemandDepositAccountDeposit";

        SsafyApiHeaderDto header = ssafyFinanceApiService.createCommonHeader(userKey, apiName);

        AccountDepositRequest request = AccountDepositRequest.builder()
                .accountNo(accountNo).transactionBalance(TRANSACTION_BALANCE).build();

        return post(FinOpenApiPaths.ACCOUNT_DEPOSIT, request, AccountDepositResponse.class);
    }



}
