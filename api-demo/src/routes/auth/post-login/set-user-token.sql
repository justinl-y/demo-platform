UPDATE
  public.users
SET
  token_refresh = $tokenRefresh
  , last_login = CURRENT_TIMESTAMP
WHERE
  id = $userId
;
