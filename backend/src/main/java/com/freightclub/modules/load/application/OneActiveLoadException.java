package com.freightclub.modules.load.application;

public class OneActiveLoadException extends RuntimeException {

  public OneActiveLoadException(String message) {
    super(message);
  }

  public OneActiveLoadException(String message, Throwable cause) {
    super(message, cause);
  }
}
