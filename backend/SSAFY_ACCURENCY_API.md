SSAFY 금융망 OPEN API 명세서 (예시 포함)

BASE URL: https://finopenapi.ssafy.io
요약 규칙

모든 요청 POST 메서드

요청/응답 JSON 형식

다수의 API는 공통 Header 객체를 요청 BODY에 포함

목차

1. 공통 규칙

2. 앱 관리자(개발자) API KEY

2.1 발급

2.2 재발급

3. 사용자

3.1 사용자 계정 생성

3.2 사용자 계정 조회

4. 공통 API

4.1 공통 HEADER

4.2 은행코드 조회

4.3 통화코드 조회

5. 수시입출금

5.1 상품 관리

5.2 사용자 계좌 관리

5.3 거래 및 조회

6. 예금

6.1 상품 관리

6.2 사용자 계좌 관리

7. 카드

7.1 기초 정보 관리

7.2 카드 상품 관리

7.3 사용자 카드 및 거래

참고: 별도 표기가 없는 한, 하위 API들은 공통 HEADER
와 해당 서비스 공통 오류 코드를 함께 사용합니다.

1. 공통 규칙

HTTP Method: POST

Content-Type: application/json

Body: 요청/응답 모두 JSON

공통 Header: 대부분의 API에서 Header 객체를 요청 BODY에 포함

2. 앱 관리자(개발자) API KEY
   2.1.1 앱 API KEY 발급

Endpoint: POST /ssafy/api/v1/edu/app/issuedApiKey

설명: OPEN API 사용 전, 관리자(개발자) API KEY 최초 발급

Request

변수명	설명	TYPE	길이	필수	비고
managerId	관리자 ID	String	30	Y	이메일 형식

Request Example

{
"managerId": "ssafy@ssafy.co.kr"
}


Success Response

변수명	설명	TYPE	길이	필수	비고
managerId	관리자 ID	String	30	Y
apiKey	API 키	String	40	Y	UUID 40
creationDate	생성일	String	8	Y	계정 생성일
expirationDate	만료일	String	8	Y	계정 만료일

Response Example

{
"managerId": "ssafy@ssafy.co.kr",
"apiKey": "84711cec18cf4d52b2dbfb03f20f17b",
"creationDate": "20240415",
"expirationDate": "20250415"
}


Error Codes

코드	설명
E3000	이미 존재하는 관리자 ID입니다.
E3002	관리자 ID가 유효하지 않습니다.
A1080	등록되지 않은 관리자 이메일입니다.
2.1.2 앱 API KEY 재발급

Endpoint: POST /ssafy/api/v1/edu/app/reIssuedApiKey

설명: 기존 KEY를 더 이상 사용하지 않고 새로운 KEY로 재발급

Request

변수명	설명	TYPE	길이	필수	비고
managerId	관리자 ID	String	30	Y	이메일 형식

Request Example

{
"managerId": "ssafy@ssafy.co.kr"
}


Success Response

변수명	설명	TYPE	길이	필수	비고
managerId	관리자 ID	String	30	Y
apiKey	API 키	String	40	Y	UUID 40

Response Example

{
"managerId": "ssafy@ssafy.co.kr",
"apiKey": "8644e48ee75740469ef8b5214499e5f7"
}


Error Codes

코드	설명
E3001	존재하지 않는 관리자 ID입니다.
E3002	관리자 ID가 유효하지 않습니다.
E3003	현재 사용중인 API KEY가 만료되어 재발급 불가합니다.
3. 사용자
   2.2.1 사용자 계정 생성

Endpoint: POST /ssafy/api/v1/member

설명: 앱 이용을 위한 사용자 회원가입

Request

변수명	설명	TYPE	길이	필수
apiKey	앱 관리자 API KEY	String	10	Y
userId	사용자 ID(이메일)	String	40	Y

Request Example

{
"apiKey": "8644e48ee75740469ef8b5214499e5f7",
"userId": "test@ssafy.co.kr"
}


Success Response

변수명	설명	TYPE	길이	필수	비고
userId	사용자 ID	String	40	Y
username	이름	String	10	Y	이메일 @ 앞부분
institutionCode	기관코드	String	40	Y	'00100' 고정
userKey	사용자 키	String	60	Y	랜덤 UUID
created	생성일	String	10	Y
modified	수정일	String	10	Y

Response Example

{
"userId": "test@ssafy.co.kr",
"userName": "test",
"institutionCode": "00100",
"userKey": "cf1d49ba-663b-495d-9227-fc2643aa7c5e",
"created": "2024-03-04T12:41:30.921299+09:00",
"modified": "2024-03-04T12:41:30.921295+09:00"
}


Error Codes

코드	설명
E4001	빈 데이터이거나 형식에 맞지 않는 데이터입니다.
E4002	이미 존재하는 ID입니다.
E4004	존재하지 않는 API KEY입니다.
2.2.2 사용자 계정 조회

Endpoint: POST /ssafy/api/v1/member/search

설명: 등록된 사용자 정보 조회

Request

변수명	설명	TYPE	길이	필수
apiKey	앱 관리자 API KEY	String	10	Y
userId	사용자 ID(이메일)	String	40	Y

Request Example

{
"apiKey": "8644e48ee75740469ef8b5214499e5f7",
"userId": "test@ssafy.co.kr"
}


Success Response
→ 2.2.1 사용자 계정 생성
과 동일

Response Example

{
"userId": "test@ssafy.co.kr",
"userName": "test",
"institutionCode": "00100",
"userKey": "cf1d49ba-663b-495d-9227-fc2643aa7c5e",
"created": "2024-03-04T12:41:30.921299+09:00",
"modified": "2024-03-04T12:41:30.921295+09:00"
}


Error Codes
(동일) E4001, E4002, E4004

4. 공통 API
   2.3.1 공통 HEADER

설명: 대부분의 API 요청/응답 BODY에 포함되는 Header 객체

Request Header Fields

변수명	설명	TYPE	필수	비고
apiName	API 이름	String	Y	호출 API URI의 마지막 path
transmissionDate	전송일자	String	Y	YYYYMMDD
transmissionTime	전송시각	String	Y	HHMMSS
institutionCode	기관코드	String	Y	'00100' 고정
fintechAppNo	핀테크 앱 일련번호	String	Y	'001' 고정
apiServiceCode	API 서비스 코드	String	Y	apiName과 동일
institutionTransactionUniqueNo	기관거래고유번호	String	Y	20자리 고유값
apiKey	앱 관리자 API KEY	String	Y
userKey	사용자 키	String	Y	userKey가 필요한 API에 한함
2.3.2 은행코드 조회

Endpoint: POST /ssafy/api/v1/edu/bank/inquireBankCodes

설명: 금융 상품 등록에 필요한 은행 코드 목록

Request Example

{
"Header": {
"apiName": "inquireBankCodes",
"transmissionDate": "20240401",
"transmissionTime": "135500",
"institutionCode": "00100",
"fintechAppNo": "001",
"apiServiceCode": "inquireBankCodes",
"institutionTransactionUniqueNo": "20240215121212123557",
"apiKey": "6a028e66ddbf42a6b783d78963163e29"
}
}


Response Example

{
"Header": {
"responseCode": "H0000",
"responseMessage": "정상처리 되었습니다.",
"apiName": "inquireBankCodes",
"transmissionDate": "20240401",
"transmissionTime": "135500",
"institutionCode": "00100",
"apiKey": "6a028e66ddbf42a6b783d78963163e29",
"apiServiceCode": "inquireBankCodes",
"institutionTransactionUniqueNo": "20240215121212123557"
},
"REC": [
{ "bankCode": "001", "bankName": "한국은행" },
{ "bankCode": "002", "bankName": "산업은행" },
{ "bankCode": "003", "bankName": "기업은행" },
{ "bankCode": "004", "bankName": "국민은행" }
]
}

2.3.3 통화코드 조회

Endpoint: POST /ssafy/api/v1/edu/bank/inquireBankCurrency

설명: 외화 상품 등록에 필요한 통화 코드 목록

Request Example

{
"Header": {
"apiName": "inquireBankCurrency",
"transmissionDate": "20240724",
"transmissionTime": "154635",
"institutionCode": "00100",
"fintechAppNo": "001",
"apiServiceCode": "inquireBankCurrency",
"institutionTransactionUniqueNo": "20240724154635412480",
"apiKey": "e8fb2ac291804bc98834ff7bcef7e340"
}
}


Response Example

{
"Header": {
"responseCode": "H0000",
"responseMessage": "정상처리 되었습니다.",
"apiName": "inquireBankCurrency"
},
"REC": [
{ "currency": "KRW", "currencyName": "원화" },
{ "currency": "USD", "currencyName": "달러" },
{ "currency": "EUR", "currencyName": "유로" }
]
}

5. 수시입출금
   상품 관리
   2.4.1 상품 등록

Endpoint: POST /ssafy/api/v1/edu/demandDeposit/createDemandDeposit

Request Example

{
"Header": {
"apiName": "createDemandDeposit",
"transmissionDate": "20240401",
"transmissionTime": "095500",
"institutionCode": "00100",
"fintechAppNo": "001",
"apiServiceCode": "createDemandDeposit",
"institutionTransactionUniqueNo": "20240215121212123560",
"apiKey": "6a028e66ddbf42a6b783d78963163e29"
},
"bankCode": "001",
"accountName": "한국은행 수시입출금 상품명",
"accountDescription": "한국은행 수시입출금 상품설명"
}


Response Example

{
"Header": { "responseCode": "H0000" },
"REC": [
{
"accountTypeUniqueNo": "001-1-ffa4253081d540",
"bankCode": "001",
"bankName": "한국은행",
"accountTypeCode": "1",
"accountTypeName": "수시입출금",
"accountName": "한국은행 수시입출금 상품명",
"accountDescription": "한국은행 수시입출금 상품설명",
"accountType": "DOMESTIC"
}
]
}

2.4.2 상품 조회

Endpoint: POST /ssafy/api/v1/edu/demandDeposit/inquireDemandDepositList

Request Example

{
"Header": {
"apiName": "inquireDemandDepositList",
"transmissionDate": "20240401",
"transmissionTime": "100100",
"institutionCode": "00100",
"fintechAppNo": "001",
"apiServiceCode": "inquireDemandDepositList",
"institutionTransactionUniqueNo": "20240215121212123561",
"apiKey": "6a028e66ddbf42a6b783d78963163e29"
}
}


Response Example

{
"Header": { "responseCode": "H0000" },
"REC": [
{
"accountTypeUniqueNo": "001-1-ffa4253081d540",
"bankCode": "001",
"bankName": "한국은행",
"accountTypeCode": "1",
"accountTypeName": "수시입출금",
"accountName": "한국은행 수시입출금 상품명",
"accountDescription": "한국은행 수시입출금 상품설명",
"accountType": "DOMESTIC"
},
{
"accountTypeUniqueNo": "020-1-5f3eb083664848",
"bankCode": "020",
"bankName": "우리은행"
}
]
}

사용자 계좌 관리
2.4.3 계좌 생성

Endpoint: POST /ssafy/api/v1/edu/demandDeposit/createDemandDepositAccount

Request Example

{
"Header": {
"apiName": "createDemandDepositAccount",
"transmissionDate": "20240401",
"transmissionTime": "100500",
"apiKey": "6a028e66ddbf42a6b783d78963163e29",
"userKey": "2695628f-11a1-418e-b533-9ae19e0650ec"
},
"accountTypeUniqueNo": "001-1-ffa4253081d540"
}


Response Example

{
"Header": { "responseCode": "H0000" },
"REC": [
{
"bankCode": "001",
"accountNo": "0016174648358792",
"currency": [
{ "currency": "KRW", "currencyName": "원화" }
]
}
]
}

2.4.4 계좌 목록 조회

Endpoint: POST /ssafy/api/v1/edu/demandDeposit/inquireDemandDepositAccountList

Request Example

{
"Header": {
"apiName": "inquireDemandDepositAccountList",
"transmissionDate": "20240401",
"transmissionTime": "101000",
"apiKey": "6a028e66ddbf42a6b783d78963163e29",
"userKey": "2695628f-11a1-418e-b533-9ae19e0650ec"
}
}


Response Example

{
"Header": { "responseCode": "H0000" },
"REC": [
{
"bankCode": "001",
"bankName": "한국은행",
"userName": "USER",
"accountNo": "0016174648358792",
"currency": "KRW"
},
{
"bankCode": "020",
"bankName": "우리은행",
"userName": "USER",
"accountNo": "0204667768182760",
"currency": "KRW"
}
]
}

2.4.5 계좌 조회 (단건)

Endpoint: POST /ssafy/api/v1/edu/demandDeposit/inquireDemandDepositAccount

Request Example

{
"Header": {
"apiName": "inquireDemandDepositAccount",
"userKey": "2695628f-11a1-418e-b533-9ae19e0650ec"
},
"accountNo": "0016174648358792"
}


Response Example

{
"Header": {},
"REC": [
{
"bankCode": "001",
"accountNo": "0016174648358792"
}
]
}

거래 및 조회
2.4.6 예금주 조회

Endpoint: POST /ssafy/api/v1/edu/demandDeposit/inquireDemandDepositAccountHolderName

Request Example

{
"Header": { "apiName": "inquireDemandDepositAccountHolderName" },
"accountNo": "0016174648358792"
}


Response Example

{
"REC": [
{
"bankCode": "001",
"bankName": "한국은행",
"accountNo": "0016174648358792",
"username": "USER",
"currency": "KRW"
}
]
}

2.4.7 계좌 잔액 조회

Endpoint: POST /ssafy/api/v1/edu/demandDeposit/inquireDemandDepositAccountBalance

Request Example

{
"Header": { "apiName": "inquireDemandDepositAccountBalance" },
"accountNo": "0016174648358792"
}


Response Example

{
"REC": [
{
"bankCode": "001",
"accountNo": "0016174648358792",
"accountBalance": "0"
}
]
}

2.4.8 계좌 출금

Endpoint: POST /ssafy/api/v1/edu/demandDeposit/updateDemandDepositAccountWithdrawal

Request Example

{
"Header": { "apiName": "updateDemandDepositAccountWithdrawal" },
"accountNo": "0016174648358792",
"transactionBalance": "100000",
"transactionSummary": "(수시입출금) : 출금"
}


Response Example

{
"REC": {
"transactionUniqueNo": "60",
"transactionDate": "20240401"
}
}

2.4.9 계좌 입금

Endpoint: POST /ssafy/api/v1/edu/demandDeposit/updateDemandDepositAccountDeposit

Request Example

{
"Header": { "apiName": "updateDemandDepositAccountDeposit" },
"accountNo": "0016174648358792",
"transactionBalance": "10000000",
"transactionSummary": "(수시입출금) : 입금"
}


Response Example

{
"REC": {
"transactionUniqueNo": "59",
"transactionDate": "20240401"
}
}

2.4.10 계좌 이체

Endpoint: POST /ssafy/api/v1/edu/demandDeposit/updateDemandDepositAccountTransfer

Request Example

{
"Header": { "apiName": "updateDemandDepositAccountTransfer" },
"depositAccountNo": "0204667768182760",
"depositTransactionSummary": "(수시입출금) : 입금(이체)",
"transactionBalance": "1000000",
"withdrawalAccountNo": "0016174648358792",
"withdrawalTransactionSummary": "(수시입출금) : 출금(이체)"
}


Response Example

[
{
"transactionUniqueNo": "61",
"accountNo": "0016174648358792",
"transactionType": "2",
"transactionTypeName": "출금(이체)",
"transactionAccountNo": "0204667768182760"
},
{
"transactionUniqueNo": "62",
"accountNo": "0204667768182760",
"transactionType": "1",
"transactionTypeName": "입금(이체)",
"transactionAccountNo": "0016174648358792"
}
]

2.4.12 계좌 거래 내역 조회 (목록)

Endpoint: POST /ssafy/api/v1/edu/demandDeposit/inquireTransactionHistoryList

Request Example

{
"Header": { "apiName": "inquireTransactionHistoryList" },
"accountNo": "0016174648358792",
"startDate": "20240101",
"endDate": "20241231",
"transactionType": "A",
"orderByType": "ASC"
}


Response Example

{
"REC": {
"totalCount": "3",
"list": [
{ "transactionUniqueNo": "59", "transactionTypeName": "입금" },
{ "transactionUniqueNo": "60", "transactionTypeName": "출금" }
]
}
}

2.4.13 계좌 거래 내역 조회 (단건)

Endpoint: POST /ssafy/api/v1/edu/demandDeposit/inquireTransactionHistory

Request Example

{
"Header": { "apiName": "inquireTransactionHistory" },
"accountNo": "0016174648358792",
"transactionUniqueNo": "61"
}


Response Example

{
"REC": {
"transactionUniqueNo": "61",
"transactionTypeName": "출금(이체)",
"transactionBalance": "1000000",
"transactionAfterBalance": "89900000"
}
}

6. 예금
   6.1 상품 관리
   2.5.1 상품 등록

Endpoint: POST /ssafy/api/v1/edu/deposit/createDepositProduct

Request Example

{
"Header": { "apiName": "createDepositProduct" },
"bankCode": "002",
"accountName": "특판 예금",
"accountDescription": "선착순 특판 계좌",
"subscriptionPeriod": "10",
"minSubscriptionBalance": "200000",
"maxSubscriptionBalance": "3000000",
"interestRate": "15",
"rateDescription": "이자 15프로 단기 가입"
}


Response Example

{
"REC": [
{
"accountTypeUniqueNo": "002-2-774f8e48",
"bankCode": "002",
"bankName": "산업은행",
"accountName": "특판 예금",
"interestRate": "15"
}
]
}

2.5.2 상품 조회

Endpoint: POST /ssafy/api/v1/edu/deposit/inquireDepositProducts

Request Example

{
"Header": { "apiName": "inquireDepositProducts" }
}


Response Example

{
"REC": [
{ "accountTypeUniqueNo": "002-2-d6cda5e00bb40", "bankName": "산업은행", "accountName": "산업 단기 예금" },
{ "accountTypeUniqueNo": "004-2-bafb564d", "bankName": "국민은행", "accountName": "국민 한달 예금" }
]
}

6.2 사용자 계좌 관리
2.5.3 계좌 생성

Endpoint: POST /ssafy/api/v1/edu/deposit/createDepositAccount

Request Example

{
"Header": {
"apiName": "createDepositAccount",
"userKey": "4dfb0125-27c9-4ab1-9c72-28772c59894a"
},
"withdrawalAccountNo": "0011541149756547",
"accountTypeUniqueNo": "003-2-67718ffc",
"depositBalance": "8000000"
}


Response Example

{
"REC": {
"bankCode": "003",
"bankName": "기업은행",
"accountNo": "0038268358",
"accountName": "정동의 해 예금",
"depositBalance": "8000000",
"interestRate": "7.1"
}
}

2.5.4 계좌 목록 조회

Endpoint: POST /ssafy/api/v1/edu/deposit/inquireDepositInfoList

Request Example

{
"Header": {
"apiName": "inquireDepositInfoList",
"userKey": "4dfb0125-27c9-4ab1-9c72-28772c59894a"
}
}


Response Example

{
"REC": {
"totalCount": "4",
"list": [
{ "bankName": "기업은행", "userName": "customer", "accountNo": "0019169157" },
{ "bankName": "국민은행", "userName": "customer", "accountNo": "0019016181" }
]
}
}

2.5.5 계좌 조회 (단건)

Endpoint: POST /ssafy/api/v1/edu/deposit/inquireDepositInfoDetail

Request Example

{
"Header": {
"apiName": "inquireDepositInfoDetail",
"userKey": "4dfb0125-27c9-4ab1-9c72-28772c59894a"
},
"accountNo": "0019016181"
}


Response Example

{
"REC": {
"bankCode": "004",
"bankName": "국민은행",
"userName": "customer",
"accountNo": "0019016181",
"accountName": "국민 한달 예금"
}
}

7. 카드
   7.1 기초 정보 관리
   2.8.1 카테고리 조회

Endpoint: POST /ssafy/api/v1/edu/creditCard/inquireCategoryList

Request Example

{ "Header": { "apiName": "inquireCategoryList" } }


Response Example

{
"REC": [
{ "categoryId": "CG-3fa85f6425e811e", "categoryName": "주유", "categoryDescription": "" },
{ "categoryId": "CG-4fa85f6425ad1d3", "categoryName": "대형마트", "categoryDescription": "" }
]
}

2.8.2 가맹점 등록

Endpoint: POST /ssafy/api/v1/edu/creditCard/createMerchant

Request Example

{
"Header": { "apiName": "createMerchant" },
"categoryId": "CG-4fa85f6425ad1d3",
"merchantName": "코스트코"
}


Response Example

{
"REC": [
{ "categoryId": "CG-9ca85f66311a23d", "categoryName": "생활", "merchantId": "1", "merchantName": "스타벅스" },
{ "categoryId": "CG-4fa85f6425ad1d3", "categoryName": "대형마트", "merchantId": "3", "merchantName": "코스트코" }
]
}

2.8.3 카드사 조회

Endpoint: POST /ssafy/api/v1/edu/creditCard/inquireCardIssuerCodesList

Request Example

{ "Header": { "apiName": "inquireCardIssuerCodesList" } }


Response Example

{
"REC": [
{ "cardIssuerCode": "1001", "cardIssuerName": "KB국민카드" },
{ "cardIssuerCode": "1002", "cardIssuerName": "삼성카드" }
]
}

7.2 카드 상품 관리
2.8.4 상품 등록

Endpoint: POST /ssafy/api/v1/edu/creditCard/createCreditCardProduct

Request Example

{
"Header": { "apiName": "createCreditCardProduct" },
"cardIssuerCode": "1003",
"cardName": "디지로그 London",
"baselinePerformance": "700000",
"maxBenefitLimit": "130000",
"cardDescription": "생활 20% 할인, 교통 10% 할인, 대형마트 5% 할인",
"cardBenefits": [
{ "categoryId": "CG-9ca85f66311a23d", "discountRate": "20" },
{ "categoryId": "CG-4fa85f6455cad4a", "discountRate": "10" }
]
}


Response Example

{
"REC": [
{
"cardUniqueNo": "1003-a139e9f23f1a4cc",
"cardIssuerCode": "1003",
"cardIssuerName": "롯데카드",
"cardName": "디지로그 London",
"cardBenefitsInfo": [
{ "categoryId": "CG-9ca85f66311a23d", "categoryName": "생활", "discountRate": "20.0" },
{ "categoryId": "CG-4fa85f6455cad4a", "categoryName": "교통", "discountRate": "10.0" }
]
}
]
}

2.8.5 상품 조회

Endpoint: POST /ssafy/api/v1/edu/creditCard/inquireCreditCardList

Request Example

{ "Header": { "apiName": "inquireCreditCardList" } }


Response Example

{
"REC": [
{ "cardUniqueNo": "1003-a139e9f23f1a4cc", "cardIssuerName": "롯데카드", "cardName": "디지로그 London" },
{ "cardUniqueNo": "1005-2d29fc2343024a4", "cardIssuerName": "신한카드", "cardName": "신한 TRAVEL 카드" }
]
}

7.3 사용자 카드 및 거래
2.8.6 카드 생성 (발급)

Endpoint: POST /ssafy/api/v1/edu/creditCard/createCreditCard

Request Example

{
"Header": {
"apiName": "createCreditCard",
"userKey": "6816c0c0-ec9e-4f62-8092-5a99d84f02cd"
},
"cardUniqueNo": "1003-a139e9f23f1a4cc",
"withdrawalAccountNo": "032355504232351",
"withdrawalDate": "4"
}


Response Example

{
"REC": [
{
"cardNo": "1003622654847049",
"cvc": "713",
"cardUniqueNo": "1003-a139e9f23f1a4cc",
"cardName": "디지로그 SEOUL",
"cardExpiryDate": "20290409",
"withdrawalAccountNo": "032355504232351",
"withdrawalDate": "4"
}
]
}

2.8.7 내 카드 목록 조회

Endpoint: POST /ssafy/api/v1/edu/creditCard/inquireSignUpCreditCardList

Request Example

{
"Header": {
"apiName": "inquireSignUpCreditCardList",
"userKey": "6816c0c0-ec9e-4f62-8092-5a99d84f02cd"
}
}


Response Example

{
"REC": [
{ "cardNo": "1003198565339181", "cvc": "149", "cardName": "디지로그 SEOUL" },
{ "cardNo": "1005518816096479", "cvc": "725", "cardName": "신한 TRAVEL 카드" }
]
}

2.8.9 카드 결제

Endpoint: POST /ssafy/api/v1/edu/creditCard/createCreditCardTransaction

Request Example

{
"Header": {
"apiName": "createCreditCardTransaction",
"userKey": "4dfb0125-27c9-4ab1-9c72-28772c59894a"
},
"cardNo": "1005518816096479",
"cvc": "725",
"merchantId": "1",
"paymentBalance": "500000"
}


Response Example

{
"REC": {
"transactionUniqueNo": "12",
"categoryName": "대형마트",
"merchantName": "코스트코",
"paymentBalance": "500000"
}
}

2.8.10 카드 결제 내역 조회

Endpoint: POST /ssafy/api/v1/edu/creditCard/inquireCreditCardTransactionList

Request Example

{
"Header": {
"apiName": "inquireCreditCardTransactionList",
"userKey": "2695628f-11a1-418e-b533-9ae19e0650ec"
},
"cardNo": "1005518816096479",
"cvc": "725",
"startDate": "20240401",
"endDate": "20240502"
}


Response Example

{
"REC": {
"cardIssuerName": "신한카드",
"cardName": "신한 TRAVEL 카드",
"cardNo": "1005518816096479",
"estimatedBalance": "2000000",
"transactionList": [
{ "transactionUniqueNo": "20", "categoryName": "주유", "merchantName": "SK 에너지", "transactionBalance": "1000000", "cardStatus": "승인" },
{ "transactionUniqueNo": "19", "categoryName": "주유", "merchantName": "SK 에너지", "transactionBalance": "500000", "cardStatus": "승인" }
]
}
}

2.8.11 카드 결제 취소

Endpoint: POST /ssafy/api/v1/edu/creditCard/deleteTransaction

Request Example

{
"Header": {
"apiName": "deleteTransaction",
"userKey": "4dfb0125-27c9-4ab1-9c72-28772c59894a"
},
"cardNo": "1005518816096479",
"cvc": "725",
"transactionUniqueNo": "33"
}


Response Example

{
"REC": {
"transactionUniqueNo": "33",
"categoryName": "대형마트",
"merchantName": "홈플러스",
"transactionBalance": "38000",
"status": "CANCEL"
}
}

2.8.12 청구서 조회

Endpoint: POST /ssafy/api/v1/edu/creditCard/inquireBillingStatements

Request Example

{
"Header": {
"apiName": "inquireBillingStatements",
"userKey": "4dfb0125-27c9-4ab1-9c72-28772c59894a"
},
"cardNo": "1005518816096479",
"cvc": "725",
"startMonth": "202401",
"endMonth": "202403"
}


Response Example

{
"REC": [
{
"billingMonth": "202403",
"billingList": [
{
"billingWeek": "5",
"billingDate": "20240326",
"totalBalance": "285000",
"status": "미결제",
"paymentDate": "",
"paymentTime": ""
}
]
}
]
}

2.8.13 카드 결제 계좌 수정

Endpoint: POST /ssafy/api/v1/edu/creditCard/updateWithdrawalAccount

Request Example

{
"Header": {
"apiName": "updateWithdrawalAccount",
"userKey": "4dfb0125-27c9-4ab1-9c72-28772c59894a"
},
"cardNo": "1005518816096479",
"cvc": "725",
"withdrawalAccountNo": "0011541149756547",
"withdrawalDate": "1"
}


Response Example

{
"REC": [
{
"cardNo": "1005518816096479",
"cvc": "725",
"cardUniqueNo": "1005-992db475fbb944c",
"cardName": "신한 TRAVEL 카드",
"withdrawalAccountNo": "0011541149756547",
"withdrawalDate": "1"
}
]
}
