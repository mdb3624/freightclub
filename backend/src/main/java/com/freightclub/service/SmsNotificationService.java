package com.freightclub.service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class SmsNotificationService {

    private static final Logger log = LoggerFactory.getLogger(SmsNotificationService.class);

    private final String fromNumber;
    private final boolean enabled;

    public SmsNotificationService(
        @Value("${twilio.account-sid}") String accountSid,
        @Value("${twilio.auth-token}") String authToken,
        @Value("${twilio.from-number}") String fromNumber,
        @Value("${twilio.enabled:false}") boolean enabled
    ) {
        this.fromNumber = fromNumber;
        this.enabled = enabled;
        if (enabled) {
            Twilio.init(accountSid, authToken);
        }
    }

    public void validatePhoneNumber(String phoneNumber) {
        if (phoneNumber == null || !phoneNumber.matches("^\\+[1-9]\\d{7,14}$")) {
            throw new IllegalArgumentException(
                "Invalid phone number: must be E.164 format (e.g. +12145551234), got: " + phoneNumber
            );
        }
    }

    public void send(String toPhoneNumber, String message) {
        if (!enabled) {
            log.debug("SMS disabled — skipping send to {}", toPhoneNumber);
            return;
        }
        validatePhoneNumber(toPhoneNumber);
        try {
            Message.creator(
                new PhoneNumber(toPhoneNumber),
                new PhoneNumber(fromNumber),
                message
            ).create();
        } catch (Exception e) {
            log.error("Failed to send SMS to {}: {}", toPhoneNumber, e.getMessage());
            // Do not rethrow — SMS failure must not fail the load status transition
        }
    }
}
