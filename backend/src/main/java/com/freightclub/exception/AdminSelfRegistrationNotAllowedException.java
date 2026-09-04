package com.freightclub.exception;

// Security fix (2026-09-03): public self-registration must never be able to create a platform
// Super User (ADMIN role) account. ADMIN accounts are created only via the Super User's own
// "Create User" flow (US-886) or the one-time bootstrap path (DefaultSuperUserBootstrapRunner) —
// never through the unauthenticated /api/v1/auth/register endpoint.
public class AdminSelfRegistrationNotAllowedException extends RuntimeException {
    public AdminSelfRegistrationNotAllowedException() {
        super("Self-registration as an administrator is not permitted");
    }
}
