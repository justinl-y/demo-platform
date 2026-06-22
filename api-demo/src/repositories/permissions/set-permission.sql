UPDATE
  internal.permissions
SET
  name = $name!
  , description = $description!
WHERE
  id = $permissionId!
RETURNING
  id AS permission_id
  , name
  , description
;
