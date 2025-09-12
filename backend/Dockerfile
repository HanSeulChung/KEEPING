FROM eclipse-temurin:21-jre-alpine

ENV TZ=Asia/Seoul
WORKDIR /app

RUN addgroup -S spring && adduser -S spring -G spring
USER spring

ARG JAR_FILE
COPY ${JAR_FILE} app.jar

ENV SERVER_PORT=8080
EXPOSE 8080

ENTRYPOINT ["sh","-lc","exec java -XX:MaxRAMPercentage=75 -Duser.timezone=Asia/Seoul -jar app.jar --server.port=${SERVER_PORT}"]