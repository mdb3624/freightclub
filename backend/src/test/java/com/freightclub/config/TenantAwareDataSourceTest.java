package com.freightclub.config;

import com.freightclub.security.TenantContextHolder;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.Statement;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

// US-874/875 follow-up: PostgreSQL's SET LOCAL resets at COMMIT/ROLLBACK, but Open-Session-In-
// View holds one physical connection across multiple @Transactional boundaries per request.
// Reproduced live via @PreAuthorize("@profileService.isOwner(...))") running its own
// transaction before the controller method's — the second transaction silently lost tenant
// context and RLS failed closed. These tests lock in the fix: SET LOCAL must be reapplied
// immediately after every commit()/rollback() on the same physical connection, not just once
// at connection acquisition.
class TenantAwareDataSourceTest {

    @AfterEach
    void clearTenantContext() {
        TenantContextHolder.clear();
    }

    @Test
    void reappliesSetLocal_afterCommit_onSameConnection() throws Exception {
        DataSource rawDataSource = mock(DataSource.class);
        Connection rawConnection = mock(Connection.class);
        Statement statement = mock(Statement.class);
        when(rawDataSource.getConnection()).thenReturn(rawConnection);
        when(rawConnection.createStatement()).thenReturn(statement);

        TenantContextHolder.setTenantId("tenant-1");
        TenantAwareDataSource dataSource = new TenantAwareDataSource(rawDataSource);

        Connection wrapped = dataSource.getConnection();
        // First SET LOCAL, at acquisition time.
        verify(statement, times(1)).execute(contains("SET LOCAL app.current_tenant = 'tenant-1'"));

        wrapped.commit();

        // Second SET LOCAL, reissued immediately after commit — this is the actual fix.
        ArgumentCaptor<String> sql = ArgumentCaptor.forClass(String.class);
        verify(statement, times(2)).execute(sql.capture());
        assertThat(sql.getAllValues()).allMatch(s -> s.contains("SET LOCAL app.current_tenant = 'tenant-1'"));
        verify(rawConnection, times(1)).commit();
    }

    @Test
    void reappliesSetLocal_afterRollback_onSameConnection() throws Exception {
        DataSource rawDataSource = mock(DataSource.class);
        Connection rawConnection = mock(Connection.class);
        Statement statement = mock(Statement.class);
        when(rawDataSource.getConnection()).thenReturn(rawConnection);
        when(rawConnection.createStatement()).thenReturn(statement);

        TenantContextHolder.setTenantId("tenant-2");
        TenantAwareDataSource dataSource = new TenantAwareDataSource(rawDataSource);

        Connection wrapped = dataSource.getConnection();
        wrapped.rollback();

        verify(statement, times(2)).execute(contains("SET LOCAL app.current_tenant = 'tenant-2'"));
        verify(rawConnection, times(1)).rollback();
    }

    @Test
    void doesNotReapply_whenTenantContextAlreadyCleared() throws Exception {
        DataSource rawDataSource = mock(DataSource.class);
        Connection rawConnection = mock(Connection.class);
        Statement statement = mock(Statement.class);
        when(rawDataSource.getConnection()).thenReturn(rawConnection);
        when(rawConnection.createStatement()).thenReturn(statement);

        TenantContextHolder.setTenantId("tenant-3");
        TenantAwareDataSource dataSource = new TenantAwareDataSource(rawDataSource);
        Connection wrapped = dataSource.getConnection();

        TenantContextHolder.clear();
        wrapped.commit();

        // Only the original acquisition-time SET LOCAL — no second call once context is gone.
        verify(statement, times(1)).execute(anyString());
    }
}
