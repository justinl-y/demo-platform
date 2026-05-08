UPDATE
  public.users
SET
  token_refresh_hash = $newTokenRefreshHash
WHERE
  id = $userId
  AND activated_at IS NOT NULL
  AND deactivated_at IS NULL
;
