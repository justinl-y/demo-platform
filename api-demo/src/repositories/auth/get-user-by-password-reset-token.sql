SELECT
  ua.user_id
FROM
  public.users_authentication AS ua
  INNER JOIN public.users AS u ON u.id = ua.user_id
WHERE
  ua.password_reset_token_hash = $passwordResetTokenHash!
  AND ua.password_reset_token_expiry_at > NOW()
  AND u.status = 'ACTIVE'
;
