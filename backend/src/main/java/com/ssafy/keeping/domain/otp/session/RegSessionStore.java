package com.ssafy.keeping.domain.otp.session;

import java.time.Duration;

public interface RegSessionStore {
    void setSession(String regSessionId, RegSession regSession, Duration ttl);
    RegSession getSession(String regSessionId);
    void deleteSession(String regSessionId);
    Duration remainingTtl(String regSessionId);
}
