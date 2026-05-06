package com.freightclub;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class FreightClubApplication {

    public static void main(String[] args) {
        SpringApplication.run(FreightClubApplication.class, args);
    }
}
