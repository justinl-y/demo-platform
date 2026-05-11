SELECT
	count(u.email)::int AS count_email
FROM 
	public.users AS u
WHERE
	u.email = $email
;
