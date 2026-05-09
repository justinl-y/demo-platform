SELECT
  u.id
  , u.email
  , u.full_name
  , u.known_as
  , u.password_hash
FROM
  public.users AS u
WHERE
  u.email = $email
  AND u.status = 'ACTIVE'
;
