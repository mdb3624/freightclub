package com.freightclub.security;

public interface PasswordBreachChecker {

    BreachCheckResult isBreached(String password);
}
