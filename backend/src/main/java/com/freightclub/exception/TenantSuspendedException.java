package com.freightclub.exception;

// US-884 AC-2: thrown after credentials are verified, same rationale as AccountSuspendedException
// — never reveal a tenant's suspension status to someone who hasn't proven they know a valid
// password within it. Distinct from AccountSuspendedException so the message and audit trail
// are unambiguous about which of the two independent locks (BR-1) actually blocked the login.
public class TenantSuspendedException extends RuntimeException {
    public TenantSuspendedException() {
        super("This organization's account has been suspended");
    }
}
