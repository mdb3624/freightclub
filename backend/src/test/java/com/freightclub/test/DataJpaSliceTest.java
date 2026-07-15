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
        "spring.jpa.hibernate.ddl-auto=create-drop",
        // application.yml sets spring.jpa.properties.hibernate.hbm2ddl.auto=none, which wins over
        // spring.jpa.hibernate.ddl-auto above (properties.* is merged directly into Hibernate's
        // settings map after ddl-auto is applied). Must be overridden explicitly here too.
        "spring.jpa.properties.hibernate.hbm2ddl.auto=create-drop",
        // src/test/resources/application-test.yml (active under the "test" Spring profile, as used
        // in the Docker test environment) sets jakarta.persistence.schema-generation.database.action=none.
        // Per the JPA spec, when this property is explicitly present Hibernate honors it and ignores
        // hibernate.hbm2ddl.auto entirely — silently skipping schema generation. Must be overridden too,
        // or this test only passes on a bare host run (no "test" profile active) and fails under Docker.
        "spring.jpa.properties.jakarta.persistence.schema-generation.database.action=drop-and-create"
})
public @interface DataJpaSliceTest {}
