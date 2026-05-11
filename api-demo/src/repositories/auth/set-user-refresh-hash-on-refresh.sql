UPDATE
  public.users
SET
  token_refresh_hash = $newTokenRefreshHash
WHERE
  id = $userId
  AND status = 'ACTIVE'
RETURNING
  id
;
