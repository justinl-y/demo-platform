UPDATE
  public.users_authentication AS ua
SET
  password_hash = $hashedNewPassword!
  , password_reset_token_hash = NULL
  , password_reset_token_expiry_at = NULL
  , refresh_token_hash = NULL
FROM
  public.users AS u
WHERE
  u.id = ua.user_id
  AND ua.password_reset_token_hash = $passwordResetTokenHash!
  AND ua.password_reset_token_expiry_at > NOW()
  AND u.status = 'ACTIVE'
RETURNING
  ua.user_id
;
