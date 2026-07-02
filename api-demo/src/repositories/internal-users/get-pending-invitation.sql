SELECT
  ua.user_id
FROM
  internal.users_authentication AS ua
  INNER JOIN internal.users AS u ON u.id = ua.user_id
WHERE
  ua.invite_token_hash = $inviteTokenHash!
  AND ua.invite_token_expiry_at > NOW()
  AND u.status = 'INVITED'
;
