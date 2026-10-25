-- 1. Create notification table for storing owner in-app notifications
CREATE TABLE IF NOT EXISTS center.notification (
    notification_id SERIAL PRIMARY KEY,
    owner_id INTEGER NOT NULL,
    event_type VARCHAR(64) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notification_owner_id FOREIGN KEY (owner_id)
        REFERENCES center.owner(owner_id) ON DELETE CASCADE
);

-- 2. Grant privileges to adoption_user
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA center TO adoption_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA center TO adoption_user;
