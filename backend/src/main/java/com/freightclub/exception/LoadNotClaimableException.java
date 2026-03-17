package com.freightclub.exception;

public class LoadNotClaimableException extends RuntimeException {
    public LoadNotClaimableException(String message) {
        super(message);
    }
}
