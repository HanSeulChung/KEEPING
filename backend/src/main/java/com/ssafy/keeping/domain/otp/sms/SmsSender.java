package com.ssafy.keeping.domain.otp.sms;

import net.nurigo.sdk.message.response.SingleMessageSentResponse;

public interface SmsSender {
    SingleMessageSentResponse send(String to, String text);
}
