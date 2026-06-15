-- Insert permissions (matching route declarations)
INSERT INTO internal.permissions (name, description) VALUES
  ('USERS_READ', 'Read users'),
  ('USERS_WRITE', 'Create/update/delete users'),
  ('USERS_AUTHORIZE', 'Invite/activate/deactivate users')
ON CONFLICT (name) DO NOTHING;

-- Insert roles
INSERT INTO internal.roles (name, description) VALUES
  ('ADMIN', 'Full access to all users operations'),
  ('STAFF', 'Read-only access to users'),
  ('MODERATOR', 'Can manage user lifecycle')
ON CONFLICT (name) DO NOTHING;

-- Assign permissions to roles
-- ADMIN: all permissions
INSERT INTO internal.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM internal.roles r, internal.permissions p
WHERE r.name = 'ADMIN' AND p.name IN ('USERS_READ', 'USERS_WRITE', 'USERS_AUTHORIZE')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- STAFF: read only
INSERT INTO internal.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM internal.roles r, internal.permissions p
WHERE r.name = 'STAFF' AND p.name = 'USERS_READ'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- MODERATOR: read and authorize (invite/activate/deactivate)
INSERT INTO internal.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM internal.roles r, internal.permissions p
WHERE r.name = 'MODERATOR' AND p.name IN ('USERS_READ', 'USERS_AUTHORIZE')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Assign roles to users
-- super user: ADMIN
INSERT INTO internal.users_roles (user_id, role_id)
SELECT u.id, r.id FROM internal.users u, internal.roles r
WHERE u.email = 'user.super@email.com' AND r.name = 'ADMIN'
ON CONFLICT (user_id, role_id) DO NOTHING;

-- alice: ADMIN
INSERT INTO internal.users_roles (user_id, role_id)
SELECT u.id, r.id FROM internal.users u, internal.roles r
WHERE u.email = 'alice.smith@example.com' AND r.name = 'ADMIN'
ON CONFLICT (user_id, role_id) DO NOTHING;

-- bob: STAFF
INSERT INTO internal.users_roles (user_id, role_id)
SELECT u.id, r.id FROM internal.users u, internal.roles r
WHERE u.email = 'bob.johnson@example.com' AND r.name = 'STAFF'
ON CONFLICT (user_id, role_id) DO NOTHING;

-- carol: MODERATOR
INSERT INTO internal.users_roles (user_id, role_id)
SELECT u.id, r.id FROM internal.users u, internal.roles r
WHERE u.email = 'carol.williams@example.com' AND r.name = 'MODERATOR'
ON CONFLICT (user_id, role_id) DO NOTHING;
