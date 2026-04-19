UPDATE
  public.users
SET
  token_refresh_hash = $newTokenRefreshHash
WHERE
  id = $userId
;
