CREATE SCHEMA IF NOT EXISTS internal;

ALTER TABLE public.users SET SCHEMA internal;
ALTER TABLE public.users_authentication SET SCHEMA internal;

-- repoint the trigger function whose body still targets the old public schema
-- (the trigger itself moves with internal.users; only the function body needs updating)
CREATE OR REPLACE FUNCTION public.fn_create_users_authentication_row()
RETURNS trigger AS $$
BEGIN
  INSERT INTO internal.users_authentication (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE internal.permissions (
  id uuid PRIMARY KEY DEFAULT uuidv7()
  , name varchar(255) NOT NULL UNIQUE
  , description varchar(255) NOT NULL
);

CREATE TABLE internal.roles (
  id uuid PRIMARY KEY DEFAULT uuidv7()
  , name varchar(255) NOT NULL UNIQUE
  , description varchar(255) NOT NULL
);

CREATE TABLE internal.role_permissions (
  id uuid PRIMARY KEY DEFAULT uuidv7()
  , role_id uuid NOT NULL
  , permission_id uuid NOT NULL
  , FOREIGN KEY (role_id) REFERENCES internal.roles(id) ON DELETE CASCADE
  , FOREIGN KEY (permission_id) REFERENCES internal.permissions(id) ON DELETE CASCADE
  , UNIQUE (role_id, permission_id)
);

CREATE INDEX idx_internal_role_permissions_permission_id ON internal.role_permissions (permission_id);

CREATE TABLE internal.users_roles (
  id uuid PRIMARY KEY DEFAULT uuidv7()
  , user_id uuid NOT NULL
  , role_id uuid NOT NULL
  , FOREIGN KEY (user_id) REFERENCES internal.users(id) ON DELETE CASCADE
  , FOREIGN KEY (role_id) REFERENCES internal.roles(id) ON DELETE CASCADE
  , UNIQUE (user_id, role_id)
);

CREATE INDEX idx_internal_users_roles_role_id ON internal.users_roles (role_id);

