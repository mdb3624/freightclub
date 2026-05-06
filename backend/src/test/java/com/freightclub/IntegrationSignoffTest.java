package com.freightclub;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test") // Loads the local DB settings from application-test.yml
public class IntegrationSignoffTest {

    @Test
    void contextLoads() {
        // If this reaches here, Hibernate/Flyway connected to your local DB successfully
        System.out.println("Successfully connected to local PostgreSQL!");
    }
}