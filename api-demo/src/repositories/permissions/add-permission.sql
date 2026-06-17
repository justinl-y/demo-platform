INSERT INTO internal.permissions
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
	id AS permission_id
	, name
	, description
;
