INSERT INTO internal.roles
	(
		name
		, description
	)
VALUES
	(
		$name!
		, $description
	)
RETURNING
	id AS role_id
	, name
	, description
;
