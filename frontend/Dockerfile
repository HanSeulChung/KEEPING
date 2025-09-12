# --- Build stage ---
    FROM node:18-alpine AS builder
    WORKDIR /app
    ENV NEXT_TELEMETRY_DISABLED=1
    RUN apk add --no-cache libc6-compat
    
    # pnpm 기준 설치
    COPY package.json pnpm-lock.yaml ./
    RUN corepack enable && pnpm install --frozen-lockfile
    
    # 소스 복사 & 빌드 (standalone 산출)
    COPY . .
    RUN pnpm build
    
    # --- Runtime stage ---
    FROM node:18-alpine AS runner
    WORKDIR /app
    ENV NODE_ENV=production \
        NEXT_TELEMETRY_DISABLED=1 \
        HOSTNAME=0.0.0.0 \
        PORT=3000
    RUN apk add --no-cache libc6-compat
    
    # standalone + 정적 + public
    COPY --from=builder /app/.next/standalone ./
    COPY --from=builder /app/.next/static ./.next/static
    COPY --from=builder /app/public ./public
    
    EXPOSE 3000
    CMD ["node", "server.js"]
    