SELECT
	ur.role_id
FROM
	internal.users_roles AS ur
WHERE
	ur.user_id = $userId!
;
