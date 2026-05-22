UPDATE
  public.users
SET
  email = $newEmail!
WHERE
  id = $userId!
RETURNING
  id AS user_id
  , email
;
