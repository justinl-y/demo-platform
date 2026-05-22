SELECT
	u.id AS user_id
FROM
	public.users AS u
WHERE
	u.email = $email!
;
