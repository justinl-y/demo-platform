SELECT
	u.id AS user_id
FROM
	internal.users AS u
WHERE
	u.email = $email!
;
