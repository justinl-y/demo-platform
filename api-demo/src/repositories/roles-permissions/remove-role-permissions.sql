DELETE FROM
  internal.roles_permissions
WHERE
  role_id = $roleId!
RETURNING
  id AS roles_permissions_id
;
