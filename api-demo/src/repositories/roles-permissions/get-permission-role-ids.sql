SELECT
	rp.role_id
FROM
	internal.roles_permissions AS rp
WHERE
	rp.permission_id = $permissionId!
LIMIT 1
;
