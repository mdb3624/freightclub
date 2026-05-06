package com.freightclub.modules.shipper;

import static org.assertj.core.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.freightclub.modules.shipper.application.ShipperReputationCacheInvalidator.LoadCancelledEvent;
import com.freightclub.modules.shipper.application.ShipperReputationCacheInvalidator.PaymentConfirmedEvent;
import com.freightclub.modules.shipper.application.ShipperReputationCacheInvalidator.RatingSubmittedEvent;
import com.freightclub.modules.shipper.application.ShipperService;
import com.freightclub.modules.shipper.domain.ShipperReputation;
import com.freightclub.modules.shipper.infrastructure.ShipperReputationRepository;
import com.freightclub.modules.shipper.infrastructure.rest.ShipperReputationResponse;
import com.freightclub.security.TenantContextHolder;
import java.math.BigDecimal;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.cache.CacheManager;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class ShipperPublicProfileIntegrationTest {

  private static final String TENANT_ID = "test-tenant-123";
  private static final String SHIPPER_ID = "shipper-456";

  @Autowired private MockMvc mockMvc;
  @Autowired private ObjectMapper objectMapper;
  @Autowired private ShipperService shipperService;
  @Autowired private ShipperReputationRepository repository;
  @Autowired private CacheManager cacheManager;
  @Autowired private ApplicationEventPublisher eventPublisher;

  @BeforeEach
  void setup() {
    TenantContextHolder.setTenantId(TENANT_ID);
    cacheManager.getCache("shipperReputation").clear();
  }

  @AfterEach
  void cleanup() {
    TenantContextHolder.clear();
    cacheManager.getCache("shipperReputation").clear();
  }

  @Test
  void testGetPublicReputation_FastPayer() throws Exception {
    ShipperReputation rep =
        ShipperReputation.createNew(TENANT_ID, SHIPPER_ID, new BigDecimal("7"), 50, 0, 0);
    shipperService.updateShipperReputation(
        SHIPPER_ID,
        rep.getAveragePaymentSpeedDays(),
        rep.getCompletedLoadCount(),
        rep.getCancelledLoadCount(),
        rep.getOpenDisputeCount());

    mockMvc
        .perform(
            get("/api/v1/shippers/{shipperId}/public-reputation", SHIPPER_ID)
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.shipperId").value(SHIPPER_ID))
        .andExpect(jsonPath("$.paymentSpeedLabel").value("Typically pays in 7 days"))
        .andExpect(jsonPath("$.completedLoadCount").value(50))
        .andExpect(jsonPath("$.isNewShipper").value(false))
        .andExpect(jsonPath("$.hasHighRiskFlags").value(false))
        .andExpect(jsonPath("$.riskWarningText").isEmpty());
  }

  @Test
  void testGetPublicReputation_NewShipperBadge() throws Exception {
    ShipperReputation rep = ShipperReputation.createNew(TENANT_ID, SHIPPER_ID, null, 0, 0, 0);
    shipperService.updateShipperReputation(
        SHIPPER_ID,
        rep.getAveragePaymentSpeedDays(),
        rep.getCompletedLoadCount(),
        rep.getCancelledLoadCount(),
        rep.getOpenDisputeCount());

    mockMvc
        .perform(
            get("/api/v1/shippers/{shipperId}/public-reputation", SHIPPER_ID)
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.isNewShipper").value(true))
        .andExpect(jsonPath("$.paymentSpeedLabel").value("New shipper — no rating yet"));
  }

  @Test
  void testGetPublicReputation_HighRiskCancellations() throws Exception {
    ShipperReputation rep =
        ShipperReputation.createNew(TENANT_ID, SHIPPER_ID, new BigDecimal("14"), 100, 3, 0);
    shipperService.updateShipperReputation(
        SHIPPER_ID,
        rep.getAveragePaymentSpeedDays(),
        rep.getCompletedLoadCount(),
        rep.getCancelledLoadCount(),
        rep.getOpenDisputeCount());

    mockMvc
        .perform(
            get("/api/v1/shippers/{shipperId}/public-reputation", SHIPPER_ID)
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.hasHighRiskFlags").value(true))
        .andExpect(
            jsonPath("$.riskWarningText")
                .value("This shipper has a history of cancellations, which can strand truckers"));
  }

  @Test
  void testGetPublicReputation_HighRiskDisputes() throws Exception {
    ShipperReputation rep =
        ShipperReputation.createNew(TENANT_ID, SHIPPER_ID, new BigDecimal("10"), 80, 0, 3);
    shipperService.updateShipperReputation(
        SHIPPER_ID,
        rep.getAveragePaymentSpeedDays(),
        rep.getCompletedLoadCount(),
        rep.getCancelledLoadCount(),
        rep.getOpenDisputeCount());

    mockMvc
        .perform(
            get("/api/v1/shippers/{shipperId}/public-reputation", SHIPPER_ID)
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.hasHighRiskFlags").value(true))
        .andExpect(
            jsonPath("$.riskWarningText")
                .value("This shipper has a history of payment disputes"));
  }

  @Test
  void testGetPublicReputation_NotFound() throws Exception {
    mockMvc
        .perform(
            get("/api/v1/shippers/{shipperId}/public-reputation", "nonexistent-shipper")
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isNotFound());
  }

  @Test
  void testGetPublicReputation_CacheHit() throws Exception {
    ShipperReputation rep =
        ShipperReputation.createNew(TENANT_ID, SHIPPER_ID, new BigDecimal("7"), 50, 0, 0);
    shipperService.updateShipperReputation(
        SHIPPER_ID,
        rep.getAveragePaymentSpeedDays(),
        rep.getCompletedLoadCount(),
        rep.getCancelledLoadCount(),
        rep.getOpenDisputeCount());

    // First request: cache miss
    mockMvc
        .perform(
            get("/api/v1/shippers/{shipperId}/public-reputation", SHIPPER_ID)
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk());

    // Verify cache has entry
    assertThat(shipperService.getShipperReputation(SHIPPER_ID)).isNotNull();

    // Second request: should hit cache (instant, no DB query)
    mockMvc
        .perform(
            get("/api/v1/shippers/{shipperId}/public-reputation", SHIPPER_ID)
                .contentType(MediaType.APPLICATION_JSON))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.paymentSpeedLabel").value("Typically pays in 7 days"));
  }

  @Test
  void testCacheInvalidation_OnPaymentConfirmed() {
    ShipperReputation rep =
        ShipperReputation.createNew(TENANT_ID, SHIPPER_ID, new BigDecimal("14"), 5, 0, 0);
    shipperService.updateShipperReputation(
        SHIPPER_ID,
        rep.getAveragePaymentSpeedDays(),
        rep.getCompletedLoadCount(),
        rep.getCancelledLoadCount(),
        rep.getOpenDisputeCount());

    // Warm the cache
    var cached = shipperService.getShipperReputation(SHIPPER_ID);
    assertThat(cached).isNotNull();
    assertThat(cached.getAveragePaymentSpeedDays()).isEqualTo(new BigDecimal("14"));

    // Publish PaymentConfirmedEvent (simulates payment going through)
    eventPublisher.publishEvent(new PaymentConfirmedEvent(SHIPPER_ID));

    // Cache should be invalidated, next fetch triggers recalculation
    var cacheEntry = cacheManager.getCache("shipperReputation").get(SHIPPER_ID);
    assertThat(cacheEntry).isNull();
  }

  @Test
  void testCacheInvalidation_OnRatingSubmitted() {
    ShipperReputation rep =
        ShipperReputation.createNew(TENANT_ID, SHIPPER_ID, new BigDecimal("7"), 50, 0, 0);
    shipperService.updateShipperReputation(
        SHIPPER_ID,
        rep.getAveragePaymentSpeedDays(),
        rep.getCompletedLoadCount(),
        rep.getCancelledLoadCount(),
        rep.getOpenDisputeCount());

    // Warm the cache
    shipperService.getShipperReputation(SHIPPER_ID);

    // Publish RatingSubmittedEvent
    eventPublisher.publishEvent(new RatingSubmittedEvent(SHIPPER_ID));

    // Cache should be invalidated
    var cacheEntry = cacheManager.getCache("shipperReputation").get(SHIPPER_ID);
    assertThat(cacheEntry).isNull();
  }

  @Test
  void testCacheInvalidation_OnLoadCancelled() {
    ShipperReputation rep =
        ShipperReputation.createNew(TENANT_ID, SHIPPER_ID, new BigDecimal("7"), 50, 0, 0);
    shipperService.updateShipperReputation(
        SHIPPER_ID,
        rep.getAveragePaymentSpeedDays(),
        rep.getCompletedLoadCount(),
        rep.getCancelledLoadCount(),
        rep.getOpenDisputeCount());

    // Warm the cache
    shipperService.getShipperReputation(SHIPPER_ID);

    // Publish LoadCancelledEvent
    eventPublisher.publishEvent(new LoadCancelledEvent(SHIPPER_ID));

    // Cache should be invalidated
    var cacheEntry = cacheManager.getCache("shipperReputation").get(SHIPPER_ID);
    assertThat(cacheEntry).isNull();
  }

  @Test
  void testResponseDTO_AllFields() throws Exception {
    ShipperReputation rep =
        ShipperReputation.createNew(TENANT_ID, SHIPPER_ID, new BigDecimal("7"), 50, 1, 1);
    shipperService.updateShipperReputation(
        SHIPPER_ID,
        rep.getAveragePaymentSpeedDays(),
        rep.getCompletedLoadCount(),
        rep.getCancelledLoadCount(),
        rep.getOpenDisputeCount());

    String response =
        mockMvc
            .perform(
                get("/api/v1/shippers/{shipperId}/public-reputation", SHIPPER_ID)
                    .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getContentAsString();

    ShipperReputationResponse dto = objectMapper.readValue(response, ShipperReputationResponse.class);

    assertThat(dto.shipperId()).isEqualTo(SHIPPER_ID);
    assertThat(dto.paymentSpeedLabel()).isEqualTo("Typically pays in 7 days");
    assertThat(dto.completedLoadCount()).isEqualTo(50);
    assertThat(dto.isNewShipper()).isFalse();
    assertThat(dto.hasHighRiskFlags()).isFalse();
  }
}
