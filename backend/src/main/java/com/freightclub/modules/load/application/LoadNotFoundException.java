package com.freightclub.modules.load.application;

public class LoadNotFoundException extends RuntimeException {

    public LoadNotFoundException(String loadId) {
        super("Load not found: " + loadId);
    }
}
