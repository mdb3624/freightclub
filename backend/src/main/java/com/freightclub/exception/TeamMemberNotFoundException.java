package com.freightclub.exception;

public class TeamMemberNotFoundException extends RuntimeException {
    public TeamMemberNotFoundException(String userId) {
        super("Team member not found: " + userId);
    }
}
