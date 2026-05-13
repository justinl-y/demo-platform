UPDATE
  public.users
SET
  deactivated_at = NOW()
  , password_hash = $newPasswordHash
WHERE
  id = $userId
  AND status = 'ACTIVE'
RETURNING
  id
;
