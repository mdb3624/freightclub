package com.freightclub.config;

import com.freightclub.security.TenantContextHolder;
import org.hibernate.resource.jdbc.spi.StatementInspector;
import org.springframework.stereotype.Component;

@Component
public class RlsStatementInspector implements StatementInspector {

    @Override
    public String inspect(String sql) {
        try {
            // Get current tenant from thread-local context
            String currentTenant = TenantContextHolder.getTenantId();

            // If no tenant context, return original SQL
            if (currentTenant == null || currentTenant.isEmpty()) {
                return sql;
            }

            // Prepend RLS context setting to every SQL statement
            // This ensures the context is set on the exact connection executing the query
            return "SET LOCAL app.current_tenant = '" + currentTenant.replace("'", "''") + "'; " + sql;
        } catch (IllegalStateException e) {
            // No tenant context bound (e.g., during schema initialization or cleanup)
            // Return original SQL unchanged
            return sql;
        }
    }
}
