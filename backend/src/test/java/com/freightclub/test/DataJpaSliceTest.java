package com.freightclub.test;

import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.TestPropertySource;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Composed annotation for JPA slice tests against H2.
 *
 * Disables Flyway (legacy migrations use MySQL-specific DDL incompatible with H2)
 * and sets DDL to create-drop so the schema is derived from entity mappings instead.
 * Use this instead of bare @DataJpaTest to avoid rediscovering the workaround.
 */
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@DataJpaTest
@TestPropertySource(properties = {
        "spring.flyway.enabled=false",
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
public @interface DataJpaSliceTest {}
