package com.freightclub.service;

import com.freightclub.domain.Load;

public record LoadSettledEvent(Load load, String shipperId) {}
