package com.freightclub.security;

import com.freightclub.domain.UserRole;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

/**
 * Traceability: US-857 AC-2 (login-lookup role resolves pre-auth credentials) and AC-1
 * (registration's join-code lookup no longer goes through freightclub_runtime).
 */
@ExtendWith(MockitoExtension.class)
class LoginLookupRepositoryTest {

    @Mock private JdbcTemplate loginLookupJdbcTemplate;

    @InjectMocks
    private LoginLookupRepository repository;

    @Test
    void findUserByEmail_returnsCredentials_whenFound() throws SQLException {
        LoginLookupCredentials expected = new LoginLookupCredentials(
                "user-1", "tenant-1", "shipper@example.com", "hashed", UserRole.SHIPPER);

        when(loginLookupJdbcTemplate.query(anyString(), any(RowMapper.class), eq("shipper@example.com")))
                .thenAnswer(inv -> {
                    RowMapper<LoginLookupCredentials> mapper = inv.getArgument(1);
                    ResultSet rs = mockResultSetForUser(expected);
                    return List.of(mapper.mapRow(rs, 1));
                });

        Optional<LoginLookupCredentials> result = repository.findUserByEmail("shipper@example.com");

        assertThat(result).contains(expected);
    }

    @Test
    void findUserByEmail_returnsEmpty_whenNoRowMatches() {
        when(loginLookupJdbcTemplate.query(anyString(), any(RowMapper.class), eq("nobody@example.com")))
                .thenReturn(List.of());

        Optional<LoginLookupCredentials> result = repository.findUserByEmail("nobody@example.com");

        assertThat(result).isEmpty();
    }

    @Test
    void findUserById_returnsCredentials_whenFound() throws SQLException {
        LoginLookupCredentials expected = new LoginLookupCredentials(
                "user-1", "tenant-1", "shipper@example.com", "hashed", UserRole.SHIPPER);

        when(loginLookupJdbcTemplate.query(anyString(), any(RowMapper.class), eq("user-1")))
                .thenAnswer(inv -> {
                    RowMapper<LoginLookupCredentials> mapper = inv.getArgument(1);
                    return List.of(mapper.mapRow(mockResultSetForUser(expected), 1));
                });

        Optional<LoginLookupCredentials> result = repository.findUserById("user-1");

        assertThat(result).contains(expected);
    }

    @Test
    void findTenantByJoinCode_returnsTenant_whenFound() throws SQLException {
        TenantLookupResult expected = new TenantLookupResult("tenant-1", "ABCD1234", "Acme Freight", "FREE");

        when(loginLookupJdbcTemplate.query(anyString(), any(RowMapper.class), eq("ABCD1234")))
                .thenAnswer(inv -> {
                    RowMapper<TenantLookupResult> mapper = inv.getArgument(1);
                    return List.of(mapper.mapRow(mockResultSetForTenant(expected), 1));
                });

        Optional<TenantLookupResult> result = repository.findTenantByJoinCode("ABCD1234");

        assertThat(result).contains(expected);
    }

    @Test
    void findTenantByJoinCode_returnsEmpty_whenNoRowMatches() {
        when(loginLookupJdbcTemplate.query(anyString(), any(RowMapper.class), eq("BADCODE")))
                .thenReturn(List.of());

        Optional<TenantLookupResult> result = repository.findTenantByJoinCode("BADCODE");

        assertThat(result).isEmpty();
    }

    private ResultSet mockResultSetForUser(LoginLookupCredentials c) throws SQLException {
        ResultSet rs = mock(ResultSet.class);
        when(rs.getString("id")).thenReturn(c.userId());
        when(rs.getString("tenant_id")).thenReturn(c.tenantId());
        when(rs.getString("email")).thenReturn(c.email());
        when(rs.getString("password_hash")).thenReturn(c.passwordHash());
        when(rs.getString("role")).thenReturn(c.role().name());
        return rs;
    }

    private ResultSet mockResultSetForTenant(TenantLookupResult t) throws SQLException {
        ResultSet rs = mock(ResultSet.class);
        when(rs.getString("id")).thenReturn(t.tenantId());
        when(rs.getString("join_code")).thenReturn(t.joinCode());
        when(rs.getString("name")).thenReturn(t.name());
        when(rs.getString("plan")).thenReturn(t.plan());
        return rs;
    }
}
