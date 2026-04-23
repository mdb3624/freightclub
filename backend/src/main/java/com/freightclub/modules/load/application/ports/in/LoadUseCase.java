package com.freightclub.modules.load.application.ports.in;

import com.freightclub.modules.load.application.CreateLoadCommand;
import com.freightclub.modules.load.domain.LoadAggregate;

import java.math.BigDecimal;

public interface LoadUseCase {

    /** Creates a fully-specified load, validating state codes before persisting. */
    LoadAggregate createLoad(String tenantId, String shipperId, CreateLoadCommand cmd);

    /** Creates a minimal skeleton draft without route information. */
    LoadAggregate createDraft(String tenantId, String shipperId, BigDecimal weightLbs);

    LoadAggregate publish(String tenantId, String loadId);

    LoadAggregate claim(String tenantId, String loadId, String carrierId);

    LoadAggregate cancelLoad(String tenantId, String loadId, String reason);

    LoadAggregate startTrip(String tenantId, String loadId);

    LoadAggregate completeDelivery(String tenantId, String loadId, String podUrl);
}
