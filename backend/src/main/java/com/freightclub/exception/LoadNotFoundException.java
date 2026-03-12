package com.freightclub.exception;

public class LoadNotFoundException extends RuntimeException {
    public LoadNotFoundException(String id) {
        super("Load not found: " + id);
    }
}
