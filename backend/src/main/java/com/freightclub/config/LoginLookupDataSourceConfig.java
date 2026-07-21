package com.freightclub.config;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.jdbc.core.JdbcTemplate;

import javax.sql.DataSource;

/**
 * Two connection pools. Defining a second DataSource bean here means Spring Boot's own
 * DataSourceAutoConfiguration (which is @ConditionalOnMissingBean(DataSource.class)) backs
 * off entirely — so the primary/application datasource has to be defined explicitly too,
 * marked @Primary, or every unqualified DataSource injection in the app (JPA's
 * EntityManagerFactory included) becomes ambiguous and can silently resolve to whichever
 * bean Spring picks. That's not hypothetical: it's exactly what happened here during
 * US-857's Pre-Test Protocol run — the whole app ran through the narrow login-lookup
 * connection instead of the real one, and every query outside its two-table SELECT-only
 * grant failed with "permission denied."
 */
@Configuration
public class LoginLookupDataSourceConfig {

    @Primary
    @Bean(name = "dataSource")
    public DataSource dataSource(
            @Value("${spring.datasource.url}") String url,
            @Value("${spring.datasource.username}") String username,
            @Value("${spring.datasource.password}") String password
    ) {
        return DataSourceBuilder.create()
                .type(HikariDataSource.class)
                .url(url)
                .username(username)
                .password(password)
                .driverClassName("org.postgresql.Driver")
                .build();
    }

    @Bean(name = "loginLookupDataSource")
    public DataSource loginLookupDataSource(
            @Value("${spring.datasource.url}") String url,
            @Value("${app.login-lookup.username}") String username,
            @Value("${app.login-lookup.password}") String password
    ) {
        return DataSourceBuilder.create()
                .type(HikariDataSource.class)
                .url(url)
                .username(username)
                .password(password)
                .driverClassName("org.postgresql.Driver")
                .build();
    }

    // Same @ConditionalOnMissingBean(JdbcTemplate.class) trap as DataSource above —
    // JdbcTemplateAutoConfiguration backs off the instant any JdbcTemplate bean exists, so
    // the primary one needs an explicit, @Primary definition here too, or test fixtures/other
    // code autowiring a plain JdbcTemplate silently get the narrow login-lookup one instead.
    @Primary
    @Bean(name = "jdbcTemplate")
    public JdbcTemplate jdbcTemplate(DataSource dataSource) {
        return new JdbcTemplate(dataSource);
    }

    @Bean(name = "loginLookupJdbcTemplate")
    public JdbcTemplate loginLookupJdbcTemplate(
            @Qualifier("loginLookupDataSource") DataSource loginLookupDataSource
    ) {
        return new JdbcTemplate(loginLookupDataSource);
    }
}
