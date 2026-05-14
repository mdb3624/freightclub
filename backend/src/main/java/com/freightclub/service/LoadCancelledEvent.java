package com.freightclub.service;

import com.freightclub.domain.Load;

public record LoadCancelledEvent(Load load, String truckerId, String reason) {}
