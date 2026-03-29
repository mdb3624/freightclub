package com.freightclub.dto;

import com.freightclub.domain.EquipmentType;
import com.freightclub.domain.PayRateType;
import com.freightclub.domain.PaymentTerms;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/** Common fields shared by {@link CreateLoadRequest} and {@link UpdateLoadRequest}. */
public interface LoadFields {
    String originCity();
    String originState();
    String originZip();
    String originAddress1();
    String originAddress2();
    String destinationCity();
    String destinationState();
    String destinationZip();
    String destinationAddress1();
    String destinationAddress2();
    BigDecimal distanceMiles();
    LocalDateTime pickupFrom();
    LocalDateTime pickupTo();
    LocalDateTime deliveryFrom();
    LocalDateTime deliveryTo();
    String commodity();
    BigDecimal weightLbs();
    BigDecimal lengthFt();
    BigDecimal widthFt();
    BigDecimal heightFt();
    EquipmentType equipmentType();
    BigDecimal payRate();
    PayRateType payRateType();
    PaymentTerms paymentTerms();
    String specialRequirements();
}
