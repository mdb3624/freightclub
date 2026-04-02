package com.freightclub.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CancelLoadRequest(
        @NotBlank(message = "Cancellation reason is required")
        @Size(max = 500, message = "Reason must be 500 characters or fewer")
        String reason
) {}
