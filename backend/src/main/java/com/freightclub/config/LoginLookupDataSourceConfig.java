package com.freightclub.config;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import jakarta.persistence.EntityManagerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.transaction.PlatformTransactionManager;

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
        DataSource raw = DataSourceBuilder.create()
                .type(HikariDataSource.class)
                .url(url)
                .username(username)
                .password(password)
                .driverClassName("org.postgresql.Driver")
                .build();
        // US-858: wraps every connection Hibernate/JPA obtains with SET LOCAL
        // app.current_tenant, issued as its own statement. Replaces RlsStatementInspector,
        // which never worked (never wired into Hibernate, and its string-concatenation
        // technique is independently broken for parameterized statements).
        return new TenantAwareDataSource(raw);
    }

    @Bean(name = "loginLookupDataSource")
    public DataSource loginLookupDataSource(
            @Value("${spring.datasource.url}") String url,
            @Value("${app.login-lookup.username}") String username,
            @Value("${app.login-lookup.password}") String password
    ) {
        // Narrow pool size: this role is hit only at pre-auth lookup, and every extra pool
        // multiplies across every distinct @SpringBootTest context the suite spins up —
        // a default-sized (10) pool here was enough to exhaust Postgres's connection ceiling
        // once a third pool (superUserReadDataSource) was added alongside it.
        HikariDataSource ds = DataSourceBuilder.create()
                .type(HikariDataSource.class)
                .url(url)
                .username(username)
                .password(password)
                .driverClassName("org.postgresql.Driver")
                .build();
        ds.setMaximumPoolSize(2);
        return ds;
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

    // US-750/751/752: third connection pool, same reasoning as loginLookupDataSource above —
    // a narrowly-scoped, BYPASSRLS role (V20260901_1200) for the Super User dashboard's one
    // legitimate cross-tenant read surface, kept off the tenant-scoped JPA path entirely.
    @Bean(name = "superUserReadDataSource")
    public DataSource superUserReadDataSource(
            @Value("${spring.datasource.url}") String url,
            @Value("${app.super-user-read.username}") String username,
            @Value("${app.super-user-read.password}") String password
    ) {
        // Narrow pool size — see loginLookupDataSource's comment above; same reasoning.
        HikariDataSource ds = DataSourceBuilder.create()
                .type(HikariDataSource.class)
                .url(url)
                .username(username)
                .password(password)
                .driverClassName("org.postgresql.Driver")
                .build();
        ds.setMaximumPoolSize(2);
        return ds;
    }

    @Bean(name = "superUserReadJdbcTemplate")
    public JdbcTemplate superUserReadJdbcTemplate(
            @Qualifier("superUserReadDataSource") DataSource superUserReadDataSource
    ) {
        return new JdbcTemplate(superUserReadDataSource);
    }

    // US-880: a governed write action (suspend user, force reset, etc. — US-881/884/886) and
    // its audit log entry (US-880's admin_audit_log) must succeed or fail together. Both go
    // through superUserReadJdbcTemplate/superUserReadDataSource, so a transaction manager bound
    // to that same DataSource lets a calling service annotate its method
    // @Transactional("superUserTransactionManager") and have the action's write and the audit
    // insert share one connection/transaction — no separate coordination needed. Not @Primary:
    // the app's real transaction manager (JPA, bound to the main tenant-scoped DataSource) must
    // stay the unqualified default everywhere else.
    @Bean(name = "superUserTransactionManager")
    public PlatformTransactionManager superUserTransactionManager(
            @Qualifier("superUserReadDataSource") DataSource superUserReadDataSource
    ) {
        return new DataSourceTransactionManager(superUserReadDataSource);
    }

    // Same @ConditionalOnMissingBean(TransactionManager.class) trap as DataSource/JdbcTemplate
    // above: Spring Boot's JPA transaction-manager autoconfiguration backs off entirely the
    // instant any other PlatformTransactionManager bean exists (superUserTransactionManager,
    // just added) — so the app's real, main transaction manager needs an explicit, @Primary
    // definition here too, or every unqualified @Transactional across the entire codebase
    // (which is nearly all of it) fails at runtime with "No bean named 'transactionManager'
    // available." Discovered via the full backend suite going from 962/0 to 4 failures/115
    // errors the moment superUserTransactionManager was added.
    @Primary
    @Bean(name = "transactionManager")
    public PlatformTransactionManager transactionManager(EntityManagerFactory entityManagerFactory) {
        return new JpaTransactionManager(entityManagerFactory);
    }
}
