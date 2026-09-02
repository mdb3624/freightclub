package com.freightclub.exception;

// US-874 BR-7 / US-875 BR-4 / US-877 BR-4: a tenant can never be left with zero admins.
public class LastTenantAdminException extends RuntimeException {
    public LastTenantAdminException() {
        super("A tenant must always have at least one admin");
    }
}
