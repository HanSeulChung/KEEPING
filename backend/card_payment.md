<카드 결제 API>
- **화면 위치:** `/stores/{storeId}/prepay`
- **API URL:** `/api/v1/stores/{storeId}/prepayment`
- Method: POST

### **Path Parameters:**
- `storeId`: 선결제할 가게의 고유 식별자 (숫자)
- `userId` : 회원의 userId
  1. UserId를 받아와야 하는데 일단 requestBody에 입력하는 형식으로 들어가고,
  2. 후에 @AuthenticationPrincipal Long userId 로 받을 예정

### ** Request Body:**
- `userId`
- `cardNo`
- `cvc`
- `paymentBalance`

카드 결제 흐름
<1 - userKey 조회> -> 아래 외부 키를 안쓰고 , Users DB 혹은 Owners DB에 회원가입 할 때 저장할 예정
이 때, userKey가 null이 아닐 경우 아래를 진행하면 되지만, SSAFY은행에 가입되어있지 않은 사람인 경우 userKey가 NULL일 수도 있음

<userKey 조회 API - 사용안함>
`userId` 를 통해 외부API에서 `userKey` 조회
POST : https://finopenapi.ssafy.io/ssafy/api/v1/member
```
<요청>
{
    "apiKey": "e17ca6be4bc44d4ead381bd9cbbd075a", // API 키는 고정
    "userId": "입력받은 userId"
}

<응답 - 정상>
{
    "userId": "test@ssafy.co.kr",
    "userName": "test",
    "institutionCode": "00100",
    "userKey": "cf1d49ba-663b-495d-9227-fc2643aa7c5e",
    "created": "2024-03-04T12:41:30.921299+09:00",
    "modified": "2024-03-04T12:41:30.921295+09:00"
}

<응답 - 비정상>
{
    "responseCode": "E4003",
    "responseMessage": "존재하지 않는 ID입니다."
}

E4001 : 빈 데이터이거나 형식에 맞지 않는 데이터입니다.
E4002 : 이미 존재하는 ID 입니다.
E4003 : 존재하지 않는 ID 입니다.
E4004 : 존재하지 않는 API KEY 입니다.
Q1000 : 그 이외의 에러 메시지
Q1001 : 요청 본문의 형식이 잘못되었습니다. JSON 형식 또는 데이터 타입을 확인해 주세요.
```

<2>
`storeId`를 통해 db에서 `merchantId`를 가져옴

<3> 외부 API 키 카드조회
`userKey`, `cardNo`, `cvc`, `merchantId`, `paymentBalance`를 이용하여 외부 API에 
<카드 결제 요청>
POST : https://finopenapi.ssafy.io/ssafy/api/v1/edu/creditCard/createCreditCardTransaction
이 때,
`transmissionDate` : 현재날짜 (YYYYMMDD)
`transmissionTime` : 현재시각 min +1 (HHMMSS)


예시
```
<요청>
{
    "Header": {
        "apiName": "createCreditCardTransaction", // 고정
        "transmissionDate": "20250910", // YYYYMMDD
        "transmissionTime": "155000", // HHMMSS
        "institutionCode": "00100", // 고정
        "fintechAppNo": "001", // 고정
        "apiServiceCode": "createCreditCardTransaction", // 고정
        "institutionTransactionUniqueNo": "20250910155000000000", // YYYYMMDDHHMMSS + 고유번호6자리 (결제될 때마다 000000 부터 하나씩 올라가도록 설정해야함 - 날짜시각이 다르다면 상관없음) 
        "apiKey": "e17ca6be4bc44d4ead381bd9cbbd075a", // 고정
        "userKey": "4731e043-32a7-42b5-90f1-6994b13a06a2" // 외부API에서 조회한 userKey
    },
    "cardNo": "1001528696818995",
    "cvc": "793",
    "merchantId": "14274",
    "paymentBalance": "1000"
}

<응답>
{
    "Header": {
        "responseCode": "H0000",
        "responseMessage": "정상처리 되었습니다.",
        "apiName": "createCreditCardTransaction",
        "transmissionDate": "20240408",
        "transmissionTime": "135600",
        "institutionCode": "00100",
        "apiKey": "21d5e78661d7490895eaebb24f1dfc42",
        "apiServiceCode": "createCreditCardTransaction",
        "institutionTransactionUniqueNo": "20240215121212123571"
    },
    "REC": {
        "transactionUniqueNo": "12",
        "categoryId": "CG-4fa85f6425ad1d3",
        "categoryName": "대형마트",
        "merchantId": "1",
        "merchantName": "코스트코",
        "transactionDate": "20240408",
        "transactionTime": "135242",
        "paymentBalance": "500000"
    }
}
```

<4> transactions DB 추가 (status : charge)
<5> wallet_store_lot DB 추가
<6> wallet_store_balance DB 추가
<7> settlement_tasks DB 추가

// 추후 구현 예정 - 매 주 화요일 오전(새벽 01:00)에 해당 점주 계좌(stores db의 bank_account)로 돈을 넣어줘야함
<8> storeId를 통해 해당 점주의 계좌번호에 돈을 넣어줘야함 - 점주의 userKey 역시 회원가입할 때 받을 예정
   <조건>
   1. settlement_Task 에서 pending인 애들의 금액을 해당 점주의 계좌에 넣어줘야함 (계좌 번호(accountNo)는 stores db의 bank_account)
   2. 그 애들 중 transaction에서 status가 charge인 애들 중 가게ID가 동일한 애들의 금액을 모두 합쳐서 해당 점주에게 화요일 오전 01시에 입금해줘야함 
   <계좌 조회 외부 API>
      POST : https://finopenapi.ssafy.io/ssafy/api/v1/edu/demandDeposit/inquireDemandDepositAccount
   ``` 예시 요청과 응답
   <요청>
   {     
    "Header": {
        "apiName": "inquireDemandDepositAccount",
        "transmissionDate": "20240401",
        "transmissionTime": "101500",
        "institutionCode": "00100",
        "fintechAppNo": "001",
        "apiServiceCode": "inquireDemandDepositAccount",
        "institutionTransactionUniqueNo": "20240215121212123455",
        "apiKey": "6a028e66ddbf42a6b783d78963163e29",
        "userKey": "2695628f-11a1-418e-b533-9ae19e0650ec"
    }, 
    "accountNo": "0016174648358792"
    }
   
    <응답 예시>
      {
    "Header": {
        "responseCode": "H0000",
        "responseMessage": "정상처리 되었습니다.",
        "apiName": "inquireDemandDepositAccount",
        "transmissionDate": "20240401",
        "transmissionTime": "101500",
        "institutionCode": "00100",
        "apiKey": "6a028e66ddbf42a6b783d78963163e29",
        "apiServiceCode": "inquireDemandDepositAccount",
        "institutionTransactionUniqueNo": "20240215121212123455"
    },
    "REC": {
        "bankCode": "001",
        "bankName": "한국은행",
        "userName": "USER",
        "accountNo": "0016174648358792",
        "accountName": "한국은행 수시입출금 상품명",
        "accountTypeCode": "1",
        "accountTypeName": "수시입출금",
        "accountCreatedDate": "20240401",
        "accountExpiryDate": "20290401",
        "dailyTransferLimit": "100000000",
        "oneTimeTransferLimit": "20000000",
        "accountBalance": "0",
        "lastTransactionDate": "",
        "currency": "KRW"
    }
    }
   ```

    <계좌 입금 외부 API>
      POST : https://finopenapi.ssafy.io/ssafy/api/v1/edu/demandDeposit/updateDemandDepositAccountDeposit
    ```
    <요청>
    {
        "Header": {
            "apiName": "updateDemandDepositAccountDeposit", // 고정
            "transmissionDate": "20240401", // 전송 일자
            "transmissionTime": "102500", // 전송 시간
            "institutionCode": "00100", // 고정
            "fintechAppNo": "001", // 고정
            "apiServiceCode": "updateDemandDepositAccountDeposit", // 고정
            "institutionTransactionUniqueNo": "20240215121212123463",
            // 기관거래고유번호 : 새로운 번호로 임의 채번(YYYYMMMM + HHMMSS + 일련번호6자리) 
            "apiKey": "21d5e78661d7490895eaebb24f1dfc42", // 고정
            "userKey": "2695628f-11a1-418e-b533-9ae19e0650ec" // 점주의 userId를 통해 userKey를 조회하고 입력해줘야함 <1 - userKey 조회> 참조
        },
        "accountNo": "0016174648358792", // 계좌 조회를 통해 구해야함 
        "transactionBalance": "100000000", // transactions db조회
        "transactionSummary": "(수시입출금) : 입금" // 고정
    }
    
    <응답>
    {
        "Header": {
            "responseCode": "H0000",
            "responseMessage": "정상처리 되었습니다.",
            "apiName": "updateDemandDepositAccountDeposit",
            "transmissionDate": "20240401",
            "transmissionTime": "102500",
            "institutionCode": "00100",
            "apiKey": "6a028e66ddbf42a6b783d78963163e29",
            "apiServiceCode": "updateDemandDepositAccountDeposit",
            "institutionTransactionUniqueNo": "20240215121212123463"
        },
        "REC": {
            "transactionUniqueNo": "59",
            "transactionDate": "20240401"
        }
    }      
          
    ```
