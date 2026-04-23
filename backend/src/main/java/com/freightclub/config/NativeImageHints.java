package com.freightclub.config;

import com.freightclub.domain.*;
import com.freightclub.dto.*;
import com.freightclub.modules.load.infrastructure.persistence.jpa.LoadEntity;
import com.freightclub.security.JwtProperties;
import org.springframework.aot.hint.MemberCategory;
import org.springframework.aot.hint.RuntimeHints;
import org.springframework.aot.hint.RuntimeHintsRegistrar;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.ImportRuntimeHints;

/**
 * GraalVM Native Image reachability hints for the FreightClub backend.
 *
 * These hints supplement the JSON configs in META-INF/native-image/ and are
 * processed by Spring Boot's AOT engine during the native compile phase
 * (mvn -Pnative package). They ensure that classes accessed via reflection,
 * Jackson serialization, Hibernate proxy generation, and classpath resources
 * are retained in the native image.
 *
 * 128MB RAM budget (Render free tier):
 *   - Native image RSS at idle is typically 40-70MB for this app.
 *   - PDFBox BOL generation peaks at ~25MB additional heap; run it on the
 *     first request after startup to amortize font-loading cost.
 *   - Keep EMAIL_ENABLED=false unless you confirm JavaMail native support.
 *   - Do NOT enable spring-boot-devtools in the native profile.
 */
@Configuration
@ImportRuntimeHints(NativeImageHints.FreightClubRuntimeHints.class)
public class NativeImageHints {

    static class FreightClubRuntimeHints implements RuntimeHintsRegistrar {

        @Override
        public void registerHints(RuntimeHints hints, ClassLoader classLoader) {

            // ── JPA Entities ─────────────────────────────────────────────────────────
            // Hibernate 6 generates bytecode-enhanced proxies at AOT build time, but
            // still needs full reflection for @PrePersist callbacks, field-based access,
            // and Criteria API metamodel generation.
            for (Class<?> entity : new Class<?>[]{
                    Claim.class, Load.class, LoadDocument.class, LoadEvent.class,
                    Notification.class, Rating.class, RefreshToken.class,
                    Tenant.class, User.class,
                    LoadEntity.class
            }) {
                hints.reflection().registerType(entity, MemberCategory.values());
            }

            // ── Enums ─────────────────────────────────────────────────────────────────
            // Hibernate @Enumerated(STRING) calls Enum.valueOf() via reflection.
            // Jackson deserializes enum query params and JSON bodies the same way.
            for (Class<?> enumType : new Class<?>[]{
                    ClaimStatus.class, DocumentType.class, EquipmentType.class,
                    LoadStatus.class, PaymentTerms.class, PayRateType.class,
                    UserRole.class
            }) {
                hints.reflection().registerType(enumType,
                        MemberCategory.INVOKE_PUBLIC_METHODS,
                        MemberCategory.INVOKE_DECLARED_METHODS,
                        MemberCategory.PUBLIC_FIELDS,
                        MemberCategory.DECLARED_FIELDS);
            }

            // ── DTOs ──────────────────────────────────────────────────────────────────
            // Jackson's ObjectMapper uses reflection to discover constructors and
            // getters/setters on request/response bodies. Records need declared
            // constructors; POJOs need public methods and declared fields.
            for (Class<?> dto : new Class<?>[]{
                    AuthResponse.class,
                    CancelLoadRequest.class,
                    CreateLoadRequest.class,
                    CreateRatingRequest.class,
                    DieselPriceResponse.class,
                    DocumentResponse.class,
                    ErrorResponse.class,
                    LoadBoardFilter.class,
                    LoadContactInfo.class,
                    LoadEventResponse.class,
                    LoadFields.class,
                    LoadResponse.class,
                    LoadSummaryResponse.class,
                    LoginRequest.class,
                    NotificationResponse.class,
                    ProfileResponse.class,
                    RatingResponse.class,
                    RatingSummaryResponse.class,
                    RefreshResponse.class,
                    RegisterRequest.class,
                    ShipperPublicProfileResponse.class,
                    UpdateLoadRequest.class,
                    UpdateProfileRequest.class,
                    UserResponse.class
            }) {
                hints.reflection().registerType(dto,
                        MemberCategory.INVOKE_PUBLIC_CONSTRUCTORS,
                        MemberCategory.INVOKE_DECLARED_CONSTRUCTORS,
                        MemberCategory.INVOKE_PUBLIC_METHODS,
                        MemberCategory.DECLARED_FIELDS);
            }

            // ── @ConfigurationProperties ──────────────────────────────────────────────
            // Spring's configuration binding uses setter reflection to populate
            // @ConfigurationProperties classes from application.yml at startup.
            hints.reflection().registerType(JwtProperties.class, MemberCategory.values());

            // ── JJWT 0.12.6 internals ────────────────────────────────────────────────
            // jjwt-impl and jjwt-jackson are runtime-scoped; their implementation
            // classes are discovered by the jjwt-api SPI at parse / build time.
            // Without these hints, Jwts.builder() and Jwts.parser() fail at runtime
            // with ClassNotFoundException in a native image.
            for (String jjwtClass : new String[]{
                    "io.jsonwebtoken.impl.DefaultClaims",
                    "io.jsonwebtoken.impl.DefaultJwt",
                    "io.jsonwebtoken.impl.DefaultJws",
                    "io.jsonwebtoken.impl.DefaultJwtBuilder",
                    "io.jsonwebtoken.impl.DefaultJwtParser",
                    "io.jsonwebtoken.impl.DefaultJwtParserBuilder",
                    "io.jsonwebtoken.jackson.io.JacksonDeserializer",
                    "io.jsonwebtoken.jackson.io.JacksonSerializer"
            }) {
                hints.reflection().registerTypeIfPresent(classLoader, jjwtClass,
                        MemberCategory.INVOKE_DECLARED_CONSTRUCTORS,
                        MemberCategory.INVOKE_DECLARED_METHODS,
                        MemberCategory.DECLARED_FIELDS);
            }

            // ── PostgreSQL JDBC driver ────────────────────────────────────────────────
            // DriverManager.getConnection() loads the driver by class name from
            // META-INF/services/java.sql.Driver. The class must be reachable.
            hints.reflection().registerTypeIfPresent(classLoader, "org.postgresql.Driver",
                    MemberCategory.INVOKE_PUBLIC_CONSTRUCTORS,
                    MemberCategory.INVOKE_PUBLIC_METHODS);

            // ── Hibernate PostgreSQL dialect ──────────────────────────────────────────
            // Loaded by class name from spring.jpa.properties.hibernate.dialect in
            // application.yml. Must survive dead-code elimination.
            hints.reflection().registerTypeIfPresent(classLoader,
                    "org.hibernate.dialect.PostgreSQLDialect",
                    MemberCategory.INVOKE_PUBLIC_CONSTRUCTORS,
                    MemberCategory.INVOKE_PUBLIC_METHODS);

            // ── Flyway SQL migrations ─────────────────────────────────────────────────
            // Flyway scans classpath:db/migration at startup. Every *.sql file must be
            // registered as a resource or Flyway will report "No migrations found".
            hints.resources().registerPattern("db/migration/*.sql");

            // ── PDFBox Standard 14 font resources ────────────────────────────────────
            // BolGeneratorService uses PDType1Font with Standard14Fonts.FontName
            // (HELVETICA / HELVETICA_BOLD). PDFBox reads AFM metrics from classpath
            // resources. Only Standard-14 AFMs are needed — no TTF/OTF font scanning.
            hints.resources().registerPattern("org/apache/pdfbox/resources/afm/*.afm");
            hints.resources().registerPattern("org/apache/pdfbox/resources/glyphlist/*.txt");
            hints.resources().registerPattern("org/apache/pdfbox/resources/icc/*.icc");
            hints.resources().registerPattern("org/apache/pdfbox/resources/version.properties");

            // ── JJWT service loader resources ────────────────────────────────────────
            hints.resources().registerPattern("META-INF/services/io.jsonwebtoken.*");

            // ── Bean Validation message interpolation ─────────────────────────────────
            hints.resources().registerPattern("ValidationMessages.properties");
            hints.resources().registerPattern(
                    "org/hibernate/validator/ValidationMessages.properties");
        }
    }
}
