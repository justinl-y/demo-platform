UPDATE
  public.users
SET
  token_refresh_hash = NULL
WHERE
  id = $userId
  AND token_refresh_hash IS NOT NULL
  AND is_active = TRUE
RETURNING
  id
;
