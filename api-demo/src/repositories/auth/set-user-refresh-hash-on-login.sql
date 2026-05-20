UPDATE
  public.users_authentication AS a
SET
  refresh_token_hash = $hashedRefreshToken!
  , last_login = CURRENT_TIMESTAMP
FROM
  public.users AS u
WHERE
  a.user_id = $userId!
  AND u.id = a.user_id
  AND u.status = 'ACTIVE'
RETURNING
  a.user_id AS id
;
