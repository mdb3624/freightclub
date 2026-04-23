package com.freightclub.modules.load.infrastructure.rest.dto;

import jakarta.validation.constraints.NotBlank;

public record ClaimLoadRequest(@NotBlank String carrierId) {}
