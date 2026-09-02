package com.freightclub.exception;

// US-881 AC-2: thrown after credentials are verified (never before — don't reveal suspension
// status to someone who hasn't proven they know the password), so the message can be specific.
public class AccountSuspendedException extends RuntimeException {
    public AccountSuspendedException() {
        super("This account has been suspended");
    }
}
