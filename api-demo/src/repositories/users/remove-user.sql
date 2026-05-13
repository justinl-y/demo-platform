DELETE FROM
  public.users
WHERE
  id = $userId!
  AND status = 'CREATED'
RETURNING
  id
;
