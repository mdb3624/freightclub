package com.freightclub.exception;

public class RatingAlreadyExistsException extends RuntimeException {
    public RatingAlreadyExistsException() {
        super("You have already submitted a rating for this load");
    }
}
