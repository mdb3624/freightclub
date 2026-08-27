package com.freightclub.exception;

public class PasswordBreachedException extends RuntimeException {

    public PasswordBreachedException() {
        super("This password has appeared in a known data breach. Please choose a different password.");
    }
}
