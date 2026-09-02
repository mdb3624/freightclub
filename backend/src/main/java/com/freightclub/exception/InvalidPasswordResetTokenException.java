package com.freightclub.exception;

// US-881: thrown when a reset token is missing, already used, or expired.
public class InvalidPasswordResetTokenException extends RuntimeException {
    public InvalidPasswordResetTokenException() {
        super("Invalid or expired password reset token");
    }
}
