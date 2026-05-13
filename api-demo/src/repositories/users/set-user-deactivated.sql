UPDATE
  public.users
SET
  deactivated_at = NOW()
  , password_hash = $newPasswordHash!
  , token_refresh_hash = NULL
WHERE
  id = $userId!
  AND status = 'ACTIVE'
RETURNING
  id
;
