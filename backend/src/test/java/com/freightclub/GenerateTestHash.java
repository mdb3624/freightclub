package com.freightclub;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.junit.jupiter.api.Test;

public class GenerateTestHash {
    @Test
    public void generateHash() {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String password = "N1kk101!";
        String hash = encoder.encode(password);
        System.out.println("HASH_OUTPUT:" + hash);
    }
}
