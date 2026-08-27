package com.freightclub.security;

/**
 * CLEAN: not found in the breach corpus.
 * BREACHED: found in the breach corpus — the only result that rejects a password (US-866 AC-1).
 * CHECK_UNAVAILABLE: the corpus could not be checked (network/parse failure, or the check is
 * disabled) — treated the same as CLEAN by callers (fail open, US-866 AC-4/BR-4).
 */
public enum BreachCheckResult {
    CLEAN,
    BREACHED,
    CHECK_UNAVAILABLE
}
