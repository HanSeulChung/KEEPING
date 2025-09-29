# Fintech

###구성도

![keeping_system_architecture.jpg](readme-images/keeping_system_architecture.jpg)

### 상세 설정 값

(Docker Container)
	
- nginx

    - nginx:1.27-alpine

- backend

    - eclipse-temurin:21-jre-alpine

- frontend

    - node:18-alpine AS builder

- mysql

    - mysql:8.0

- redis

    - redis:7-alpine

- certbot

    - certbot/certbot