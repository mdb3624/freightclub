package com.freightclub.modules.carrier.application;

public class CarrierCostProfileNotFoundException extends RuntimeException {

  public CarrierCostProfileNotFoundException(String message) {
    super(message);
  }

  public CarrierCostProfileNotFoundException(String message, Throwable cause) {
    super(message, cause);
  }
}
