package com.freightclub.service;

import com.freightclub.domain.Load;

public record LoadAssignedToCarrierEvent(Load load, String carrierId) {}
