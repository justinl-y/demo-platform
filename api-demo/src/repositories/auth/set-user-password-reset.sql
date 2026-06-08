UPDATE
  public.users_authentication As ua
SET
  password_reset_token_hash = $passwordResetTokenHash!
  , password_reset_token_expiry_at = NOW() + make_interval(mins => $passwordResetTokenExpiryMinutes!)
  , password_reset_email_sent_at = NULL
FROM
  public.users AS u
WHERE
  u.id = ua.user_id
  AND ua.user_id = $userId!
  AND u.status = 'ACTIVE'
RETURNING
  ua.user_id
;
