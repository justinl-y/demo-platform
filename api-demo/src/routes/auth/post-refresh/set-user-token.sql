UPDATE
  public.users
SET
  token_refresh_hash = $hashedTokenRefresh
WHERE
  id = $userId
;
