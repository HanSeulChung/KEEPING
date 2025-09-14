# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Keeping** is a Spring Boot application that implements a prepayment-based point sharing platform. The service allows customers to prepay for specific stores and share those points with groups for collective consumption.

**Tech Stack**: Java 17, Spring Boot 3.5.5, Spring Security, MySQL 8.0, JPA/Hibernate
**Architecture**: Domain-Driven Design (DDD) with clean separation of concerns

## Development Commands

### Build & Run
```bash
# Build project
./gradlew build

# Run application (port 8080)  
./gradlew bootRun

# Clean build artifacts
./gradlew clean

# Debug build with stacktrace
./gradlew build --stacktrace
```

### Testing
```bash
# Run all tests
./gradlew test

# Run tests with detailed output
./gradlew test --info
```

### Database Setup
- **MySQL**: `localhost:3306/ssafy_fintech_db`
- **Credentials**: `root/1234`
- **DDL**: Auto-update enabled (`ddl-auto: update`)
- **SQL Logging**: Enabled in development

## Architecture

### Core System Design

**Financial Integration**: Uses SSAFY Finance API as the external payment gateway. Our system acts as an intermediary platform that abstracts the complex banking operations.

**ID Mapping**: Critical pattern - internal IDs (user_id, store_id) are mapped 1:1 to external SSAFY IDs (userKey, merchantId) in our database.

**Data Model**: Based on ERD model with core entities:
- `wallets` (individual/group wallets)  
- `wallet_store_lot` (point bundles with expiration)
- `transactions` (complete transaction ledger)
- `settlement_tasks` (async settlement processing)

### Package Structure
```
com.ssafy.keeping/
├── domain/charge/          # Payment domain (DDD approach)
│   ├── controller/         # REST endpoints
│   ├── dto/               # Request/Response DTOs + SSAFY API DTOs
│   ├── entity/            # JPA entities  
│   ├── repository/        # Data access
│   └── service/           # Business logic
├── global/                # Cross-cutting concerns
│   ├── exception/         # Centralized error handling
│   ├── response/          # Standard API response wrapper
│   └── security/          # JWT + CORS configuration
```

### Key Patterns

**Exception Handling**: Use `ErrorCode` enum + `CustomException` → handled by `GlobalExceptionHandler` → returns standardized `ExceptionDto`

**API Responses**: All endpoints return `ApiResponse<T>` wrapper with timestamp and HTTP status mapping

**External API Integration**: `SsafyFinanceApiService` handles all external calls with try-catch for connection errors, while business services rely on GlobalExceptionHandler

**Scheduling**: `SettlementScheduler` processes settlement tasks with timezone-aware cron expressions

## Business Flow

### Core Prepayment Process
1. **Request**: Client sends JWT + storeId + amount + card_info
2. **ID Mapping**: Server queries userKey from JWT, merchantId from storeId
3. **External Payment**: Calls SSAFY Card Payment API (`SsafyFinanceApiService`)
4. **Internal Update**: Updates `transactions`, `wallet_store_lot`, `wallet_store_balance`
5. **Settlement Task**: Creates `SettlementTask` with PENDING status

### Settlement Processing  
1. **Scheduler**: `SettlementScheduler` runs weekly (Monday 07:30 Asia/Seoul)
2. **State Transition**: PENDING → LOCKED → COMPLETED
3. **External Transfer**: Calls SSAFY Account Deposit API to transfer funds to store owners
4. **Cancellation Window**: Until next Monday 07:30 (point unused condition applies)

### Implementation Notes

**SSAFY API Configuration**: 
- Base URL: `https://finopenapi.ssafy.io`
- API Key: `e17ca6be4bc44d4ead381bd9cbbd075a` (configured in application.yml)
- Response DTOs: `SsafyCardPaymentResponseDto` (payment) / `SsafyAccountDepositResponseDto` (deposit)

**Security**: JWT infrastructure ready but currently disabled for `/api/v1/stores/**` endpoints

**Port Management**: App runs on port 8080. Use `netstat -ano | findstr :8080` and `taskkill /F /PID XXXX` to resolve port conflicts
## Current Implementation Status

### ✅ Implemented Features
- **Prepayment API**: `POST /api/v1/stores/{storeId}/prepayment`
  - Card payment integration with SSAFY Finance API
  - Wallet and point balance management
  - Settlement task creation
- **Settlement Scheduler**: Automated weekly processing (Monday 07:30 Asia/Seoul)
  - PENDING → LOCKED → COMPLETED state transitions  
  - Store owner fund transfers via account deposit API
- **Exception Handling**: Centralized error management with `GlobalExceptionHandler`
- **API Response Standardization**: All endpoints return `ApiResponse<T>` wrapper

### 🔄 Core Services
- `PrepaymentService`: Handles prepayment transactions and wallet updates
- `SsafyFinanceApiService`: External SSAFY API integration with connection error handling
- `SettlementScheduler`: Batch processing for store settlements

### 📊 Data Entities
- `Customer`, `Owner`, `Store`: User and business management
- `Wallet`, `WalletStoreLot`, `WalletStoreBalance`: Point and balance tracking
- `Transaction`: Complete financial transaction ledger
- `SettlementTask`: Async settlement processing queue

### 📋 Pending Features
- Payment cancellation API
- User onboarding automation
- Point sharing between wallets
- Real-time notifications
- Analytics dashboard