SELECT
  u.id AS user_id
FROM
  public.users AS u
WHERE
  u.id = $userId!
  AND u.status = ANY($status!)
;
