WITH deactivated AS (
  UPDATE
    public.users
  SET
    deactivated_at = NOW()
  WHERE
    id = $userId!
    AND status = 'ACTIVE'
  RETURNING
    id
)
UPDATE
  public.users_authentication AS a
SET
  password_hash = $newPasswordHash!
  , refresh_token_hash = NULL
FROM
  deactivated AS d
WHERE
  a.user_id = d.id
RETURNING
  a.user_id AS id
;
