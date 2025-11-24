-- Initialize database for AgenticWIT
-- This script runs automatically when the PostgreSQL container starts

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create schemas
CREATE SCHEMA IF NOT EXISTS public;

-- Set search path
ALTER DATABASE agentic_wit SET search_path TO public;

-- Grant permissions
GRANT ALL ON SCHEMA public TO agentic;
GRANT ALL ON ALL TABLES IN SCHEMA public TO agentic;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO agentic;

-- Create initial test user (will be replaced by migrations)
CREATE TABLE IF NOT EXISTS _migration_status (
    id SERIAL PRIMARY KEY,
    migration_name VARCHAR(255) NOT NULL,
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO _migration_status (migration_name) VALUES ('init-db');

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Database initialized successfully!';
END $$;
