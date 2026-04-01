CREATE DATABASE test;

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

-- Key-value store for dynamic/semi-structured data
CREATE EXTENSION IF NOT EXISTS hstore SCHEMA public;
-- Case-insensitive text type (useful for emails, usernames)
CREATE EXTENSION IF NOT EXISTS citext SCHEMA public;
-- Cryptographic functions for hashing/encryption
CREATE EXTENSION IF NOT EXISTS pgcrypto SCHEMA public;
-- Track query performance statistics for optimization
CREATE EXTENSION IF NOT EXISTS pg_stat_statements SCHEMA public;
-- Trigram indexing for fast text searches and autocomplete
CREATE EXTENSION IF NOT EXISTS pg_trgm SCHEMA public;
-- Remove accents for text search and comparisons
CREATE EXTENSION IF NOT EXISTS unaccent SCHEMA public;
-- Geospatial types and functions for GIS queries
CREATE EXTENSION IF NOT EXISTS postgis SCHEMA public;

CREATE ROLE postgres;
ALTER SCHEMA public OWNER TO postgres;

-- tables
CREATE TABLE public.users (
  id uuid PRIMARY KEY DEFAULT uuidv7()
  , email VARCHAR(255) NOT NULL UNIQUE
  , full_name VARCHAR(255) NOT NULL
  , known_as VARCHAR(255)
  , password_hash VARCHAR(255) NOT NULL
  , password_reset_token VARCHAR(255) UNIQUE
  , is_active BOOLEAN NOT NULL DEFAULT TRUE
  , last_login timestamptz
  , created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
  , updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_public_users_email ON public.users(email);
CREATE INDEX idx_public_users_full_name ON public.users(full_name);

-- functions
CREATE OR REPLACE FUNCTION public.fn_make_user_email_lower_name()
RETURNS trigger AS $$
BEGIN
    NEW.email := LOWER(NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.fn_update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- triggers
CREATE TRIGGER trg_ensure_user_email_lower_case
BEFORE UPDATE OR INSERT ON public.users
FOR EACH ROW
EXECUTE PROCEDURE public.fn_make_user_email_lower_name();

CREATE TRIGGER trg_update_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.fn_update_updated_at_column();
