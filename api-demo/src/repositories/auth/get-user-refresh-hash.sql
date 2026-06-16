SELECT
  u.id
  , a.refresh_token_hash
FROM
  internal.users AS u
  INNER JOIN internal.users_authentication AS a ON a.user_id = u.id
WHERE
  u.id = $userId!
  AND a.refresh_token_hash IS NOT NULL
  AND u.status = 'ACTIVE'
;
