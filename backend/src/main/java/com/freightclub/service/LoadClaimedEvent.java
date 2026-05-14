package com.freightclub.service;

import com.freightclub.domain.Load;

public record LoadClaimedEvent(Load load, String truckerId) {}
