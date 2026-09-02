package com.freightclub.dto;

// US-881 AC-4: the reset token, never the user's new password — the Super User relays this
// out-of-band for the user to redeem themselves via POST /api/v1/auth/reset-password.
public record ForcePasswordResetResponse(String resetToken) {}
