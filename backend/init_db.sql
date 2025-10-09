-- Initialize AtonixCorp Database
-- This script runs when the PostgreSQL container starts

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Create additional database for testing if needed
-- CREATE DATABASE atonixcorp_test;