package com.freightclub.modules.load.application.ports.in;

import com.freightclub.modules.load.application.CreateLoadCommand;
import com.freightclub.modules.load.domain.LoadAggregate;

import java.math.BigDecimal;

public interface LoadUseCase {

    /** Creates a fully-specified load, validating state codes before persisting. */
    LoadAggregate createLoad(String shipperId, CreateLoadCommand cmd);

    /** Creates a minimal skeleton draft without route information. */
    LoadAggregate createDraft(String shipperId, BigDecimal weightLbs);

    /** @param callerId authenticated principal; must be the load's shipper or a {@link com.freightclub.modules.load.application.LoadNotFoundException} is thrown */
    LoadAggregate publish(String loadId, String callerId);

    /** @param carrierId authenticated principal claiming the load, never trust a client-supplied value here */
    LoadAggregate claim(String loadId, String carrierId);

    /** @param callerId authenticated principal; must be the load's shipper or a {@link com.freightclub.modules.load.application.LoadNotFoundException} is thrown */
    LoadAggregate cancelLoad(String loadId, String callerId, String reason);

    /** @param callerId authenticated principal; must be the load's assigned carrier or a {@link com.freightclub.modules.load.application.LoadNotFoundException} is thrown */
    LoadAggregate startTrip(String loadId, String callerId);

    /** @param callerId authenticated principal; must be the load's assigned carrier or a {@link com.freightclub.modules.load.application.LoadNotFoundException} is thrown */
    LoadAggregate completeDelivery(String loadId, String callerId, String podUrl);
}
