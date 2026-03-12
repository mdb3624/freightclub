package com.freightclub.exception;

public class InvalidJoinCodeException extends RuntimeException {
    public InvalidJoinCodeException() {
        super("Invalid company join code");
    }
}
