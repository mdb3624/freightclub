package com.freightclub.service;

import com.freightclub.domain.Load;

public record LoadDisputedEvent(Load load, String shipperId) {}
