UPDATE
  public.users
SET
  token_refresh_hash = $hashedTokenRefresh
  , last_login = CURRENT_TIMESTAMP
WHERE
  id = $userId
;
