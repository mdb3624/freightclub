package com.freightclub.config;

import com.freightclub.security.AuthRateLimitFilter;
import com.freightclub.security.JwtAuthenticationFilter;
import com.freightclub.security.RequestMetricsFilter;
import com.freightclub.security.UserDetailsServiceImpl;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import java.util.List;

@Configuration
@EnableWebSecurity
// US-875/877: @PreAuthorize was used throughout the codebase (ProfileController,
// TeamController) but never actually enforced — @EnableMethodSecurity was missing entirely,
// so every @PreAuthorize annotation in the app was silent decoration. Discovered while
// verifying TeamController's ROLE_TENANT_ADMIN gate (AC-5) returned 200 instead of 403 for a
// non-admin. Fixing this activates every existing @PreAuthorize check app-wide, not just this
// story's — verified via full backend suite, not just this story's tests, precisely because
// of that blast radius.
@EnableMethodSecurity
public class SecurityConfig {

    private final UserDetailsServiceImpl userDetailsService;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final AuthRateLimitFilter authRateLimitFilter;
    private final RequestMetricsFilter requestMetricsFilter;

    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    public SecurityConfig(UserDetailsServiceImpl userDetailsService,
                          JwtAuthenticationFilter jwtAuthenticationFilter,
                          AuthRateLimitFilter authRateLimitFilter,
                          RequestMetricsFilter requestMetricsFilter) {
        this.userDetailsService = userDetailsService;
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.authRateLimitFilter = authRateLimitFilter;
        this.requestMetricsFilter = requestMetricsFilter;
    }

    @Bean
    public FilterRegistrationBean<JwtAuthenticationFilter> jwtFilterRegistration() {
        FilterRegistrationBean<JwtAuthenticationFilter> registration = new FilterRegistrationBean<>(jwtAuthenticationFilter);
        registration.setEnabled(false);
        return registration;
    }

    @Bean
    public FilterRegistrationBean<AuthRateLimitFilter> authRateLimitFilterRegistration() {
        FilterRegistrationBean<AuthRateLimitFilter> registration = new FilterRegistrationBean<>(authRateLimitFilter);
        registration.setEnabled(false);
        return registration;
    }

    @Bean
    public FilterRegistrationBean<RequestMetricsFilter> requestMetricsFilterRegistration() {
        FilterRegistrationBean<RequestMetricsFilter> registration = new FilterRegistrationBean<>(requestMetricsFilter);
        registration.setEnabled(false);
        return registration;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/api/v1/auth/**", "/api/v1/market/**", "/api/test/**", "/error", "/actuator/health").permitAll()
                .requestMatchers("/api/v1/shippers/*/public-reputation").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/v1/loads/*/claim").hasRole("TRUCKER")
                .requestMatchers("/api/v1/loads/**").hasRole("SHIPPER")
                .requestMatchers("/api/v1/board/**").hasRole("TRUCKER")
                // v2 loads (modules/load hexagonal rewrite, not yet frontend-wired): mirror v1's role split.
                // Ownership (shipper-owns-load / carrier-assigned-to-load) is enforced in LoadApplicationService.
                .requestMatchers(HttpMethod.PUT, "/api/v2/loads/*/claim").hasRole("TRUCKER")
                .requestMatchers(HttpMethod.PUT, "/api/v2/loads/*/start-trip").hasRole("TRUCKER")
                .requestMatchers(HttpMethod.PUT, "/api/v2/loads/*/deliver").hasRole("TRUCKER")
                .requestMatchers("/api/v2/loads/**").hasRole("SHIPPER")
                // Ratings: post endpoints are role-specific; reads are authenticated
                .requestMatchers(HttpMethod.POST, "/api/v1/ratings/*/trucker").hasRole("SHIPPER")
                .requestMatchers(HttpMethod.POST, "/api/v1/ratings/*/shipper").hasRole("TRUCKER")
                .requestMatchers("/api/v1/ratings/**").authenticated()
                // Document uploads are trucker-only; reads are available to both roles
                .requestMatchers(HttpMethod.POST, "/api/v1/documents/*/bol-photo").hasRole("TRUCKER")
                .requestMatchers(HttpMethod.POST, "/api/v1/documents/*/pod-photo").hasRole("TRUCKER")
                .requestMatchers(HttpMethod.POST, "/api/v1/documents/*/issue").hasRole("TRUCKER")
                .requestMatchers("/api/v1/documents/**").authenticated()
                .anyRequest().authenticated()
            )
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((request, response, e) ->
                    response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized"))
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
            .addFilterBefore(authRateLimitFilter, JwtAuthenticationFilter.class)
            .addFilterBefore(requestMetricsFilter, AuthRateLimitFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }


    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        List<String> origins = List.of(allowedOrigins.split(","));
        config.setAllowedOrigins(origins);
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Requested-With"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
