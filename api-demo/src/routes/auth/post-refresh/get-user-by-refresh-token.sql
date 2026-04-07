SELECT
  u.id AS user_id
  , u.email AS email
FROM
  public.users AS u
WHERE
  u.token_refresh = $tokenRefresh
;
