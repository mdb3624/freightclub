package com.freightclub.modules.load.application.ports.in;

import com.freightclub.modules.load.application.CreateLoadCommand;
import com.freightclub.modules.load.domain.LoadAggregate;

import java.math.BigDecimal;

public interface LoadUseCase {

    /** Creates a fully-specified load, validating state codes before persisting. */
    LoadAggregate createLoad(String shipperId, CreateLoadCommand cmd);

    /** Creates a minimal skeleton draft without route information. */
    LoadAggregate createDraft(String shipperId, BigDecimal weightLbs);

    LoadAggregate publish(String loadId);

    LoadAggregate claim(String loadId, String carrierId);

    LoadAggregate cancelLoad(String loadId, String reason);

    LoadAggregate startTrip(String loadId);

    LoadAggregate completeDelivery(String loadId, String podUrl);
}
