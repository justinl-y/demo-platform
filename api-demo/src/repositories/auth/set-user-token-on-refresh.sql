UPDATE
  public.users
SET
  token_refresh_hash = $newTokenRefreshHash
WHERE
  id = $userId
  AND is_active = TRUE
;
