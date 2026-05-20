UPDATE
  public.users
SET
  email = $newEmail!
WHERE
  id = $userId!
RETURNING
  id
  , email
;
