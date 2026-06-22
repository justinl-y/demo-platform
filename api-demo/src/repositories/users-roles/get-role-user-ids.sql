SELECT
	ur.user_id
FROM
	internal.users_roles AS ur
WHERE
	ur.role_id = $roleId!
LIMIT 1
;
