package com.freightclub.modules.load.application;

import com.freightclub.modules.load.application.ports.out.CarrierSearchPort;
import com.freightclub.modules.load.application.ports.out.MatchRecommendationPort;
import com.freightclub.modules.load.domain.CarrierCandidate;
import com.freightclub.modules.load.domain.LoadPublishedEvent;
import com.freightclub.modules.load.domain.MatchRecommendation;
import com.freightclub.modules.load.domain.MatchScorer;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MatchDiscoveryServiceTest {

  @Mock
  private CarrierSearchPort carrierSearchPort;

  @Mock
  private MatchRecommendationPort matchRecommendationPort;

  @Mock
  private MatchScorer matchScorer;

  private MatchDiscoveryService service;

  @BeforeEach
  void setUp() {
    service = new MatchDiscoveryService(carrierSearchPort, matchRecommendationPort, matchScorer);
  }

  @Test
  void savesRecommendationWhenScorerReturnsPositiveScore() {
    LoadPublishedEvent event = new LoadPublishedEvent(
        "load-123", "tenant-1", "shipper-1", "FLATBED", "Dallas");
    CarrierCandidate candidate = new CarrierCandidate("carrier-1", "FLATBED", "Dallas");

    when(carrierSearchPort.findCandidates("tenant-1")).thenReturn(List.of(candidate));
    when(matchScorer.calculateScore(any(), any())).thenReturn(100);

    service.processLoadPublished(event);

    ArgumentCaptor<MatchRecommendation> captor = ArgumentCaptor.forClass(MatchRecommendation.class);
    verify(matchRecommendationPort).save(captor.capture());

    MatchRecommendation recommendation = captor.getValue();
    assertEquals("load-123", recommendation.loadId());
    assertEquals("tenant-1", recommendation.tenantId());
    assertEquals("carrier-1", recommendation.carrierId());
    assertEquals(100, recommendation.matchScore());
  }

  @Test
  void doesNotSaveRecommendationWhenScorerReturnsZero() {
    LoadPublishedEvent event = new LoadPublishedEvent(
        "load-123", "tenant-1", "shipper-1", "FLATBED", "Dallas");
    CarrierCandidate candidate = new CarrierCandidate("carrier-1", "TANKER", "Houston");

    when(carrierSearchPort.findCandidates("tenant-1")).thenReturn(List.of(candidate));
    when(matchScorer.calculateScore(any(), any())).thenReturn(0);

    service.processLoadPublished(event);

    verify(matchRecommendationPort, never()).save(any());
  }

  @Test
  void processesMultipleCandidates() {
    LoadPublishedEvent event = new LoadPublishedEvent(
        "load-123", "tenant-1", "shipper-1", "FLATBED", "Dallas");
    List<CarrierCandidate> candidates = List.of(
        new CarrierCandidate("carrier-1", "FLATBED", "Dallas"),
        new CarrierCandidate("carrier-2", "FLATBED", "Dallas"),
        new CarrierCandidate("carrier-3", "TANKER", "Houston")
    );

    when(carrierSearchPort.findCandidates("tenant-1")).thenReturn(candidates);
    when(matchScorer.calculateScore(any(), any()))
        .thenReturn(100)
        .thenReturn(85)
        .thenReturn(0);

    service.processLoadPublished(event);

    ArgumentCaptor<MatchRecommendation> captor = ArgumentCaptor.forClass(MatchRecommendation.class);
    verify(matchRecommendationPort, times(2)).save(captor.capture());

    List<MatchRecommendation> recommendations = captor.getAllValues();
    assertEquals(2, recommendations.size());
    assertEquals("carrier-1", recommendations.get(0).carrierId());
    assertEquals(100, recommendations.get(0).matchScore());
    assertEquals("carrier-2", recommendations.get(1).carrierId());
    assertEquals(85, recommendations.get(1).matchScore());
  }

  @Test
  void ignoresEventWhenEquipmentTypeIsNull() {
    LoadPublishedEvent event = new LoadPublishedEvent(
        "load-123", "tenant-1", "shipper-1", null, "Dallas");

    service.processLoadPublished(event);

    verify(carrierSearchPort, never()).findCandidates(any());
    verify(matchRecommendationPort, never()).save(any());
  }

  @Test
  void ignoresEventWhenOriginCityIsNull() {
    LoadPublishedEvent event = new LoadPublishedEvent(
        "load-123", "tenant-1", "shipper-1", null, "Houston");

    service.processLoadPublished(event);

    verify(carrierSearchPort, never()).findCandidates(any());
    verify(matchRecommendationPort, never()).save(any());
  }

  @Test
  void ignoresEventWhenBothEquipmentAndCityAreNull() {
    LoadPublishedEvent event = new LoadPublishedEvent(
        "load-123", "tenant-1", "shipper-1", null, null);

    service.processLoadPublished(event);

    verify(carrierSearchPort, never()).findCandidates(any());
    verify(matchRecommendationPort, never()).save(any());
  }

  @Test
  void handlesEmptyCandidateList() {
    LoadPublishedEvent event = new LoadPublishedEvent(
        "load-123", "tenant-1", "shipper-1", "FLATBED", "Dallas");

    when(carrierSearchPort.findCandidates("tenant-1")).thenReturn(new ArrayList<>());

    service.processLoadPublished(event);

    verify(matchRecommendationPort, never()).save(any());
  }

  @Test
  void respectsTenantIdFromEvent() {
    LoadPublishedEvent event = new LoadPublishedEvent(
        "load-123", "tenant-2", "shipper-1", "FLATBED", "Dallas");
    CarrierCandidate candidate = new CarrierCandidate("carrier-1", "FLATBED", "Dallas");

    when(carrierSearchPort.findCandidates("tenant-2")).thenReturn(List.of(candidate));
    when(matchScorer.calculateScore(any(), any())).thenReturn(100);

    service.processLoadPublished(event);

    verify(carrierSearchPort).findCandidates("tenant-2");
    ArgumentCaptor<MatchRecommendation> captor = ArgumentCaptor.forClass(MatchRecommendation.class);
    verify(matchRecommendationPort).save(captor.capture());

    assertEquals("tenant-2", captor.getValue().tenantId());
  }

  @Test
  void createsCorrectMatchCriteriaFromEvent() {
    LoadPublishedEvent event = new LoadPublishedEvent(
        "load-123", "tenant-1", "shipper-1", "FLATBED", "Dallas");
    CarrierCandidate candidate = new CarrierCandidate("carrier-1", "FLATBED", "Dallas");

    when(carrierSearchPort.findCandidates("tenant-1")).thenReturn(List.of(candidate));
    when(matchScorer.calculateScore(any(), any())).thenReturn(100);

    service.processLoadPublished(event);

    ArgumentCaptor<com.freightclub.modules.load.domain.MatchCriteria> criteriaCaptor =
        ArgumentCaptor.forClass(com.freightclub.modules.load.domain.MatchCriteria.class);
    verify(matchScorer).calculateScore(criteriaCaptor.capture(), any());

    com.freightclub.modules.load.domain.MatchCriteria criteria = criteriaCaptor.getValue();
    assertEquals("tenant-1", criteria.tenantId());
    assertEquals("FLATBED", criteria.equipmentType());
    assertEquals("Dallas", criteria.originCity());
  }

  @Test
  void handlesHighScoresCorrectly() {
    LoadPublishedEvent event = new LoadPublishedEvent(
        "load-123", "tenant-1", "shipper-1", "FLATBED", "Dallas");
    CarrierCandidate candidate = new CarrierCandidate("carrier-1", "FLATBED", "Dallas");

    when(carrierSearchPort.findCandidates("tenant-1")).thenReturn(List.of(candidate));
    when(matchScorer.calculateScore(any(), any())).thenReturn(1000);

    service.processLoadPublished(event);

    ArgumentCaptor<MatchRecommendation> captor = ArgumentCaptor.forClass(MatchRecommendation.class);
    verify(matchRecommendationPort).save(captor.capture());

    assertEquals(1000, captor.getValue().matchScore());
  }

  @Test
  void processesMaxIntegerScore() {
    LoadPublishedEvent event = new LoadPublishedEvent(
        "load-123", "tenant-1", "shipper-1", "FLATBED", "Dallas");
    CarrierCandidate candidate = new CarrierCandidate("carrier-1", "FLATBED", "Dallas");

    when(carrierSearchPort.findCandidates("tenant-1")).thenReturn(List.of(candidate));
    when(matchScorer.calculateScore(any(), any())).thenReturn(Integer.MAX_VALUE);

    service.processLoadPublished(event);

    ArgumentCaptor<MatchRecommendation> captor = ArgumentCaptor.forClass(MatchRecommendation.class);
    verify(matchRecommendationPort).save(captor.capture());

    assertEquals(Integer.MAX_VALUE, captor.getValue().matchScore());
  }
}
