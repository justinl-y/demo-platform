INSERT INTO internal.users
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
	id AS user_id
	, email
	, full_name
	, known_as
	, status
;
