UPDATE
  public.users_authentication
SET
  refresh_token_hash = NULL
WHERE
  user_id = $userId!
  AND refresh_token_hash IS NOT NULL
RETURNING
  user_id AS id
;
