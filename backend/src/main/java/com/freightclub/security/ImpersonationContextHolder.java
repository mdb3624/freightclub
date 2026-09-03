package com.freightclub.security;

// US-885: while an impersonation JWT is active, JwtAuthenticationFilter authenticates the
// request AS the target user (so tenant-scoped reads work naturally) but the real Super User's
// identity — needed to attribute BR-4's write-attribution and BR-3's end-of-session audit entry
// — travels only in the token's `impersonatedBy`/`impersonationSessionId` claims, not in
// @AuthenticationPrincipal. This ThreadLocal is how the impersonation-end endpoint recovers it.
public final class ImpersonationContextHolder {

    private static final ThreadLocal<String> SUPER_USER_ID = new ThreadLocal<>();
    private static final ThreadLocal<String> SESSION_ID = new ThreadLocal<>();

    private ImpersonationContextHolder() {}

    public static void set(String superUserId, String sessionId) {
        SUPER_USER_ID.set(superUserId);
        SESSION_ID.set(sessionId);
    }

    public static boolean isActive() {
        return SUPER_USER_ID.get() != null;
    }

    public static String getSuperUserId() {
        return SUPER_USER_ID.get();
    }

    public static String getSessionId() {
        return SESSION_ID.get();
    }

    public static void clear() {
        SUPER_USER_ID.remove();
        SESSION_ID.remove();
    }
}
