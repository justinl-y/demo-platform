INSERT INTO public.users
	(
		email
		, full_name
		, known_as
	)
VALUES
	(
		$email!
		, $fullName!
		, $knownAs
	)
RETURNING
	id
	, email
	, full_name
	, known_as
	, status
;
