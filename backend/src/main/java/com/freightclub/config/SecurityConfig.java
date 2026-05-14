package com.freightclub.config;

import com.freightclub.security.AuthRateLimitFilter;
import com.freightclub.security.JwtAuthenticationFilter;
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
import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.FilterConfig;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final UserDetailsServiceImpl userDetailsService;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final AuthRateLimitFilter authRateLimitFilter;

    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    public SecurityConfig(UserDetailsServiceImpl userDetailsService,
                          JwtAuthenticationFilter jwtAuthenticationFilter,
                          AuthRateLimitFilter authRateLimitFilter) {
        this.userDetailsService = userDetailsService;
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.authRateLimitFilter = authRateLimitFilter;
    }

    @Bean
    public FilterRegistrationBean<JwtAuthenticationFilter> jwtFilterRegistration() {
        FilterRegistrationBean<JwtAuthenticationFilter> registration = new FilterRegistrationBean<>(jwtAuthenticationFilter);
        registration.setEnabled(false);
        return registration;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(AbstractHttpConfigurer::disable)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/api/v1/auth/**", "/api/v1/market/**", "/error", "/actuator/health").permitAll()
                .requestMatchers("/api/v1/shippers/*/public-reputation").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/v1/loads/*/claim").hasRole("TRUCKER")
                .requestMatchers("/api/v1/loads/**").hasRole("SHIPPER")
                .requestMatchers("/api/v1/board/**").hasRole("TRUCKER")
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
            .addFilterBefore(authRateLimitFilter, JwtAuthenticationFilter.class);

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
    public FilterRegistrationBean<SimpleOptionsFilter> simpleOptionsFilterRegistration() {
        FilterRegistrationBean<SimpleOptionsFilter> registration = new FilterRegistrationBean<>(new SimpleOptionsFilter());
        registration.setOrder(Integer.MIN_VALUE);
        return registration;
    }

    public static class SimpleOptionsFilter implements Filter {
        @Override
        public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain) throws IOException, ServletException {
            HttpServletResponse response = (HttpServletResponse) res;
            jakarta.servlet.http.HttpServletRequest request = (jakarta.servlet.http.HttpServletRequest) req;

            if (request.getMethod().equals("OPTIONS")) {
                response.setStatus(200);
                response.addHeader("Access-Control-Allow-Origin", "*");
                response.addHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
                response.addHeader("Access-Control-Allow-Headers", "Authorization, Content-Type, X-Requested-With");
                response.addHeader("Access-Control-Allow-Credentials", "true");
                return;
            }
            chain.doFilter(req, res);
        }
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of("*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Requested-With"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
