package com.freightclub.dto;

// US-875/877 BR-3: surfaces the tenant's existing join code — no new invite mechanism.
public record JoinCodeResponse(String joinCode) {}
