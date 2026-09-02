package com.freightclub.dto;

import com.freightclub.domain.DisputeOutcome;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

// US-751 AC-3/BR-3: outcome and a non-empty reason are both mandatory — no silent resolution.
public record ResolveDisputeRequest(
        @NotNull DisputeOutcome outcome,
        @NotBlank String reason
) {}
