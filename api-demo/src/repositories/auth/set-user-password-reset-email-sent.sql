UPDATE
  public.users_authentication
SET
  password_reset_email_sent_at = now()
WHERE
  user_id = $userId!
  AND password_reset_token_hash = $passwordResetTokenHash!
RETURNING
  user_id
;
