-- Notifications table: In-app notifications
CREATE TABLE freightclub.notifications (
    id CHAR(36) PRIMARY KEY,
    tenant_id CHAR(36) NOT NULL REFERENCES freightclub.tenants(id),
    user_id CHAR(36) NOT NULL REFERENCES freightclub.users(id),
    load_id CHAR(36) REFERENCES freightclub.loads(id),
    message TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_tenant_id ON freightclub.notifications(tenant_id);
CREATE INDEX idx_notifications_user_id ON freightclub.notifications(user_id);
CREATE INDEX idx_notifications_load_id ON freightclub.notifications(load_id);
CREATE INDEX idx_notifications_is_read ON freightclub.notifications(is_read);
CREATE INDEX idx_notifications_created_at ON freightclub.notifications(created_at);
