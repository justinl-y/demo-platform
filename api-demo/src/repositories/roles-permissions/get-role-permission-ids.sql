SELECT
	rp.permission_id
FROM
	internal.roles_permissions AS rp
WHERE
	rp.role_id = $roleId!
	AND rp.permission_id = ANY($permissionIds!)
;
