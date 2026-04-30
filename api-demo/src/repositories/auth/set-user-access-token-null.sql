UPDATE
  public.users
SET
  access_token = NULL
WHERE
  id = $userId
  AND access_token IS NOT NULL
  AND is_active = TRUE
RETURNING
  id
;
