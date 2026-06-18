UPDATE
  internal.roles
SET
  name = $name!
  , description = $description
WHERE
  id = $roleId!
RETURNING
  id AS role_id
  , name
  , description
;
