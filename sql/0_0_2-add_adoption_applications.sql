-- 1. Ensure columns exist (nullable initially to allow backfilling)
ALTER TABLE center.dog ALTER COLUMN dog_owner_id DROP NOT NULL;
ALTER TABLE center.dog ADD COLUMN IF NOT EXISTS dog_status VARCHAR(35);
ALTER TABLE center.dog ADD COLUMN IF NOT EXISTS dog_fee NUMERIC(10,2);

-- 2. Migrate existing records:
-- Dogs that already have an owner become 'ADOPTED', others 'AVAILABLE'
UPDATE center.dog
SET dog_status = CASE
    WHEN dog_owner_id IS NOT NULL THEN 'ADOPTED'
    ELSE 'AVAILABLE'
END
WHERE dog_status IS NULL;

-- Backfill fees for existing dogs to 0.00
UPDATE center.dog
SET dog_fee = 0.00
WHERE dog_fee IS NULL;

-- 3. Enforce NOT NULL and DEFAULT constraints now that all rows are populated
ALTER TABLE center.dog ALTER COLUMN dog_status SET DEFAULT 'AVAILABLE';
ALTER TABLE center.dog ALTER COLUMN dog_status SET NOT NULL;

ALTER TABLE center.dog ALTER COLUMN dog_fee SET DEFAULT 0.00;
ALTER TABLE center.dog ALTER COLUMN dog_fee SET NOT NULL;

-- 4. Create adoption_application table
CREATE TABLE IF NOT EXISTS center.adoption_application (
    application_id SERIAL PRIMARY KEY,
    owner_id INTEGER NOT NULL,
    dog_id INTEGER NOT NULL,
    status VARCHAR(35) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_application_owner_id FOREIGN KEY (owner_id)
        REFERENCES center.owner(owner_id) ON DELETE CASCADE,
    CONSTRAINT fk_application_dog_id FOREIGN KEY (dog_id)
        REFERENCES center.dog(dog_id) ON DELETE CASCADE
);

-- 5. Grant privileges to adoption_user
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA center TO adoption_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA center TO adoption_user;