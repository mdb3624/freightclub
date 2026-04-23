package com.freightclub.modules.load.domain;

/**
 * Encapsulates the search criteria extracted from a published load.
 * The tenantId constrains the carrier search to the same tenant — enforcing multi-tenancy.
 */
public record MatchCriteria(
        String tenantId,
        String equipmentType,
        String originCity
) {
    public MatchCriteria {
        if (tenantId == null || tenantId.isBlank())
            throw new LoadDomainException("MatchCriteria requires a non-blank tenantId");
        if (equipmentType == null || equipmentType.isBlank())
            throw new LoadDomainException("MatchCriteria requires a non-blank equipmentType");
        if (originCity == null || originCity.isBlank())
            throw new LoadDomainException("MatchCriteria requires a non-blank originCity");
    }
}
