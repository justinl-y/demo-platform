-- Assign roles to users
-- super user: ADMIN
INSERT INTO internal.users_roles
  (user_id, role_id)
SELECT
  u.id
  , r.id
FROM
  internal.users AS u
  CROSS JOIN internal.roles AS r
WHERE
  u.email = 'user.super@email.com'
  AND r.name = 'ADMIN'
ON CONFLICT (user_id, role_id) DO NOTHING
;

-- alice: ADMIN
INSERT INTO internal.users_roles
  (user_id, role_id)
SELECT
  u.id
  , r.id
FROM
  internal.users AS u
  CROSS JOIN internal.roles AS r
WHERE
  u.email = 'alice.smith@example.com' 
  AND r.name = 'ADMIN'
ON CONFLICT (user_id, role_id) DO NOTHING
;

-- bob: INTERNAL_USER_READ
INSERT INTO internal.users_roles
  (user_id, role_id)
SELECT
  u.id
  , r.id
FROM
  internal.users AS u
  CROSS JOIN internal.roles AS r
WHERE
  u.email = 'bob.johnson@example.com'
  AND r.name = 'INTERNAL_USER_READ'
ON CONFLICT (user_id, role_id) DO NOTHING
;

-- carol: INTERNAL_USER_ADMIN
INSERT INTO internal.users_roles
  (user_id, role_id)
SELECT
  u.id
  , r.id
FROM
  internal.users AS u
  CROSS JOIN internal.roles AS r
WHERE
  u.email = 'carol.williams@example.com'
  AND r.name = 'INTERNAL_USER_ADMIN'
ON CONFLICT (user_id, role_id) DO NOTHING
;
