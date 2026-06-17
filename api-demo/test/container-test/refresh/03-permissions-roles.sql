-- Insert permissions (matching route declarations)
INSERT INTO internal.permissions
  (name, description)
VALUES
  ('INTERNAL_USERS_READ', 'Read users'),
  ('INTERNAL_USERS_WRITE', 'Create/update/delete users'),
  ('INTERNAL_USERS_AUTHORIZE_WRITE', 'Invite/activate/deactivate users'),
  ('INTERNAL_PERMISSIONS_READ', 'Read permissions'),
  ('INTERNAL_PERMISSIONS_WRITE', 'Create/update/delete permissions')
ON CONFLICT (name) DO NOTHING;

-- Insert roles
INSERT INTO internal.roles
  (name, description)
VALUES
  ('ADMIN', 'Full access to all resources'),
  ('INTERNAL_USER_READ', 'Read access to base resources'),
  ('INTERNAL_USER_ADMIN', 'Internal user lifecycle management')
ON CONFLICT (name) DO NOTHING;

-- Assign permissions to roles
-- ADMIN: all permissions
INSERT INTO internal.role_permissions
  (role_id, permission_id)
SELECT
  r.id
  , p.id
FROM
  internal.roles AS r
  CROSS JOIN internal.permissions AS p
WHERE
  r.name = 'ADMIN'
ON CONFLICT (role_id, permission_id) DO NOTHING
;

-- INTERNAL_USER_READ: read access to base resources
INSERT INTO internal.role_permissions
  (role_id, permission_id)
SELECT
  r.id
  , p.id
FROM
  internal.roles AS r
  CROSS JOIN internal.permissions AS p
WHERE
  r.name = 'INTERNAL_USER_READ'
  AND p.name = ANY('{INTERNAL_USERS_READ}')
ON CONFLICT (role_id, permission_id) DO NOTHING
;

-- INTERNAL_USER_ADMIN: create/edit users & manage authorization (invite/activate/deactivate)
INSERT INTO
  internal.role_permissions (role_id, permission_id)
SELECT
  r.id
  , p.id
FROM
  internal.roles AS r
  CROSS JOIN internal.permissions AS p
WHERE
  r.name = 'INTERNAL_USER_ADMIN'
  AND p.name = ANY('{INTERNAL_USERS_READ, INTERNAL_USERS_WRITE, INTERNAL_USERS_AUTHORIZE_WRITE}')
ON CONFLICT (role_id, permission_id) DO NOTHING
;
