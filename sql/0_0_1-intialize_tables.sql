-- 1. Create user
CREATE USER adoption_user WITH PASSWORD 'adoption_pass123';

-- 2. Grant privileges on the database created by POSTGRES_DB
GRANT ALL PRIVILEGES ON DATABASE adoption_center TO adoption_user;
SET ROLE adoption_user;

-- 3. Create schema owned by adoption_user
CREATE SCHEMA center AUTHORIZATION adoption_user;

-- 4. Set default schema for adoption_user
ALTER ROLE adoption_user SET search_path TO center;

-- 5. Create owners table
CREATE TABLE center.owner (
                        owner_id SERIAL PRIMARY KEY,
                        owner_name VARCHAR(255) NOT NULL,
                        owner_money NUMERIC(10,2) NOT NULL
);

-- 6. Create dogs table
CREATE TABLE center.dog (
                      dog_id SERIAL PRIMARY KEY,
                      dog_name VARCHAR(255) NOT NULL,
                      dog_age INTEGER NOT NULL,
                      dog_owner_id INTEGER NOT NULL,
                      CONSTRAINT fk_dog_owner_id FOREIGN KEY (dog_owner_id)
                          REFERENCES center.owner(owner_id) ON DELETE CASCADE
);

-- 7. Grant privileges on schema objects
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA center TO adoption_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA center TO adoption_user;

-- 8. Ensure future tables/sequences get privileges automatically
ALTER DEFAULT PRIVILEGES IN SCHEMA center
GRANT ALL ON TABLES TO adoption_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA center
GRANT ALL ON SEQUENCES TO adoption_user;
