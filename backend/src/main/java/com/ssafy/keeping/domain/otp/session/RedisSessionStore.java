package com.ssafy.keeping.domain.otp.session;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;

@Component
@RequiredArgsConstructor
public class RedisSessionStore implements RegSessionStore{

    private final StringRedisTemplate redis;
    private final ObjectMapper om;

    private static final String REG_KEY_PREFIX = "reg:session:";
    private static final Duration REG_TTL = Duration.ofMinutes(30);

    @Override
    public void setSession(String regSessionId, RegSession regSession, Duration ttl) {
        try {
            redis.opsForValue().set(REG_KEY_PREFIX + regSessionId, om.writeValueAsString(regSession), ttl);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public RegSession getSession(String regSessionId) {
        String key = REG_KEY_PREFIX + regSessionId;
        String json = redis.opsForValue().get(key);

        if(json == null) {
            throw new IllegalStateException("가입 세션이 만료되었습니다. 다시 시도해주세요.");
        }

        try {
            return om.readValue(json, RegSession.class);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public void deleteSession(String regSessionId) {
        redis.delete(REG_KEY_PREFIX + regSessionId);
    }

    @Override
    public Duration remainingTtl(String regSessionId) {
        Long seconds = redis.getConnectionFactory() != null ? redis.getConnectionFactory().getConnection()
                .keyCommands().ttl((REG_KEY_PREFIX + regSessionId).getBytes()) : null;

        if(seconds == null || seconds < 0 ) {
            return REG_TTL;
        }

        return Duration.ofSeconds(seconds);
    }
}
