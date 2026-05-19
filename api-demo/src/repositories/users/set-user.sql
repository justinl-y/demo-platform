UPDATE
  public.users
SET
  full_name = $fullName!
  , known_as = $knownAs
WHERE
  id = $userId!
RETURNING
  id
  , full_name
  , known_as
;