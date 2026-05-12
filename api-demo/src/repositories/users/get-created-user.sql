SELECT
  u.id
FROM
  public.users AS u
WHERE
  u.id = $userId
  AND u.status = 'CREATED'
;
