package com.freightclub.exception;

// US-885 BR-5/AC-5: a Super User cannot impersonate another ADMIN-role user — impersonation
// targets tenant-scoped users only.
public class CannotImpersonateAdminException extends RuntimeException {
    public CannotImpersonateAdminException() {
        super("Cannot impersonate another Super User");
    }
}
