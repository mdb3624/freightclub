package com.freightclub.exception;

// US-885 BR-6/AC-4: starting impersonation requires the Super User to re-confirm their own
// password immediately before starting — a stolen/hijacked session alone must not be enough.
public class InvalidReauthenticationException extends RuntimeException {
    public InvalidReauthenticationException() {
        super("Re-authentication failed");
    }
}
