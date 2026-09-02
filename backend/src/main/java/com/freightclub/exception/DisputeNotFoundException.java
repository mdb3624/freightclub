package com.freightclub.exception;

public class DisputeNotFoundException extends RuntimeException {
    public DisputeNotFoundException(String disputeId) {
        super("Open dispute not found: " + disputeId);
    }
}
