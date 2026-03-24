package com.freightclub.exception;

public class DocumentUploadRequiredException extends RuntimeException {
    public DocumentUploadRequiredException(String message) {
        super(message);
    }
}
