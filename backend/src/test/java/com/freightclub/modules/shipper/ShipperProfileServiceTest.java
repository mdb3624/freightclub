package com.freightclub.modules.shipper;

import com.freightclub.modules.shipper.application.ShipperProfileService;
import com.freightclub.modules.shipper.domain.ShipperProfile;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import static org.junit.jupiter.api.Assertions.*;

@DisplayName("ShipperProfileService - Completeness Calculation")
class ShipperProfileServiceTest {

  private ShipperProfileService service;

  @BeforeEach
  void setUp() {
    service = new ShipperProfileService();
  }

  @Test
  @DisplayName("Completeness 0% when all fields null")
  void testCompletenessZeroWhenEmpty() {
    var profile = new ShipperProfile();
    assertEquals(0, service.calculateCompleteness(profile));
  }

  @Test
  @DisplayName("Completeness 20% with company_name only")
  void testCompletenessWithCompanyNameOnly() {
    var profile = new ShipperProfile();
    profile.setCompanyName("Apex Freight");
    assertEquals(20, service.calculateCompleteness(profile));
  }

  @Test
  @DisplayName("Completeness 40% with company_name + billing_email")
  void testCompletenessWithCompanyAndEmail() {
    var profile = new ShipperProfile();
    profile.setCompanyName("Apex Freight");
    profile.setBillingEmail("billing@apex.com");
    assertEquals(40, service.calculateCompleteness(profile));
  }

  @Test
  @DisplayName("Completeness 85% with required fields (no MC/USDOT, no logo)")
  void testCompletenessWithRequiredFieldsOnly() {
    var profile = new ShipperProfile();
    profile.setCompanyName("Apex Freight");
    profile.setBillingEmail("billing@apex.com");
    profile.setPhoneNumber("(512) 555-0182");
    profile.setCity("Austin");
    profile.setState("TX");
    profile.setZipCode("78701");
    // completeness: 20 + 20 + 15 + 15 + 5 + 10 = 85%
    assertEquals(85, service.calculateCompleteness(profile));
  }

  @Test
  @DisplayName("Completeness 100% with all fields including MC and logo")
  void testCompletenessWithAllFields() {
    var profile = new ShipperProfile();
    profile.setCompanyName("Apex Freight");
    profile.setBillingEmail("billing@apex.com");
    profile.setPhoneNumber("(512) 555-0182");
    profile.setCity("Austin");
    profile.setState("TX");
    profile.setZipCode("78701");
    profile.setMcNumber("123456");
    profile.setLogoUrl("https://s3.example.com/logo.png");
    // completeness: 20 + 20 + 15 + 15 + 5 + 10 + 15 + 5 = 105 (capped at 100)
    assertEquals(100, service.calculateCompleteness(profile));
  }

  @Test
  @DisplayName("Completeness caps at 100%")
  void testCompletenessCapAt100() {
    var profile = new ShipperProfile();
    profile.setCompanyName("Apex Freight");
    profile.setBillingEmail("billing@apex.com");
    profile.setPhoneNumber("(512) 555-0182");
    profile.setCity("Austin");
    profile.setState("TX");
    profile.setZipCode("78701");
    profile.setMcNumber("123456");
    profile.setUsdotNumber("12345678");
    profile.setLogoUrl("https://s3.example.com/logo.png");
    // All fields present; should cap at 100%
    int completeness = service.calculateCompleteness(profile);
    assertTrue(completeness <= 100, "Completeness should never exceed 100%");
  }

  @Test
  @DisplayName("isPublishReady returns true when completeness >= 80")
  void testIsPublishReadyTrue() {
    var profile = new ShipperProfile();
    profile.setCompanyName("Apex Freight");
    profile.setBillingEmail("billing@apex.com");
    profile.setPhoneNumber("(512) 555-0182");
    profile.setCity("Austin");
    profile.setState("TX");
    profile.setZipCode("78701");
    profile.setCompletenessPercent(85);
    assertTrue(service.isPublishReady(profile));
  }

  @Test
  @DisplayName("isPublishReady returns false when completeness < 80")
  void testIsPublishReadyFalse() {
    var profile = new ShipperProfile();
    profile.setCompanyName("Apex Freight");
    profile.setCompletenessPercent(40);
    assertFalse(service.isPublishReady(profile));
  }

  @Test
  @DisplayName("isPublishReady returns true when completeness exactly 80")
  void testIsPublishReadyAtBoundary() {
    var profile = new ShipperProfile();
    profile.setCompletenessPercent(80);
    assertTrue(service.isPublishReady(profile));
  }
}
