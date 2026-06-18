DELETE FROM
  internal.roles
WHERE
  id = $roleId!
RETURNING
  id AS role_id
;
