-- Trigram GIN indexes backing the list-endpoint search filters.
--
-- The search uses case-insensitive substring matching (ILIKE '%term%'). A leading
-- wildcard is not sargable for a B-tree, so without these indexes every search
-- falls back to a sequential scan. A pg_trgm GIN index supports infix ILIKE, letting
-- the planner use a bitmap index scan instead. pg_trgm is enabled in the init migration.
--
-- Only the columns actually searched are covered: users by full_name/email, roles and
-- permissions by name. (The endpoints also match on id::text, but substring search of a
-- UUID is not a meaningful access path and is left to scan.)

CREATE INDEX idx_internal_users_full_name_trgm ON internal.users USING gin (full_name gin_trgm_ops);
CREATE INDEX idx_internal_users_email_trgm ON internal.users USING gin (email gin_trgm_ops);
CREATE INDEX idx_internal_roles_name_trgm ON internal.roles USING gin (name gin_trgm_ops);
CREATE INDEX idx_internal_permissions_name_trgm ON internal.permissions USING gin (name gin_trgm_ops);
