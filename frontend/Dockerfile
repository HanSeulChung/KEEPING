FROM node:20-alpine AS deps
WORKDIR /app
ENV HUSKY=0
COPY package*.json ./
RUN npm ci

FROM node:20-alpine AS build
WORKDIR /app
ENV HUSKY=0
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV HUSKY=0
COPY --from=build /app ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force
EXPOSE 3000
CMD ["npm","run","start"]