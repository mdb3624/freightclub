package com.freightclub.dto;

// US-886 AC-1/AC-2: the one-time setup token, never a password — the Super User relays this
// out-of-band for the new user to redeem via POST /api/v1/auth/reset-password.
public record ProvisioningResponse(String setupToken) {}
