package com.freightclub.exception;

// US-881 BR-5/AC-5: prevents accidental self-lockout with no recovery path.
public class CannotSuspendSelfException extends RuntimeException {
    public CannotSuspendSelfException() {
        super("A Super User cannot suspend their own account");
    }
}
