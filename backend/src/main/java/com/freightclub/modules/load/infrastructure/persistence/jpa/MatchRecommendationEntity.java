package com.freightclub.modules.load.infrastructure.persistence.jpa;

import jakarta.persistence.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "match_recommendations")
public class MatchRecommendationEntity {

    @Id
    @Column(length = 36, nullable = false, updatable = false)
    private String id;

    @Column(name = "load_id", length = 36, nullable = false)
    private String loadId;

    @Column(name = "tenant_id", length = 36, nullable = false)
    private String tenantId;

    @Column(name = "carrier_id", length = 36, nullable = false)
    private String carrierId;

    @Column(name = "match_score", nullable = false)
    private int matchScore;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    protected MatchRecommendationEntity() {}

    public MatchRecommendationEntity(String loadId, String tenantId, String carrierId, int matchScore) {
        this.id = UUID.randomUUID().toString();
        this.loadId = loadId;
        this.tenantId = tenantId;
        this.carrierId = carrierId;
        this.matchScore = matchScore;
        this.createdAt = OffsetDateTime.now();
    }

    public String getId()         { return id; }
    public String getLoadId()     { return loadId; }
    public String getTenantId()   { return tenantId; }
    public String getCarrierId()  { return carrierId; }
    public int getMatchScore()    { return matchScore; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
}
