DELETE FROM
  internal.permissions
WHERE
  id = $permissionId!
RETURNING
  id AS permission_id
;
