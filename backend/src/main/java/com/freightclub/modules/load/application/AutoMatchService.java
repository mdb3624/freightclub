package com.freightclub.modules.load.application;

import com.freightclub.modules.load.domain.LoadPublishedEvent;

/** @deprecated Replaced by {@link MatchDiscoveryService}. */
@Deprecated
public class AutoMatchService {

    private final MatchDiscoveryService delegate;

    public AutoMatchService(MatchDiscoveryService delegate) {
        this.delegate = delegate;
    }

    public void processLoadPublished(LoadPublishedEvent event) {
        delegate.processLoadPublished(event);
    }
}
