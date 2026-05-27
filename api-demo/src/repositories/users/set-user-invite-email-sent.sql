UPDATE
  public.users_authentication
SET
  invite_email_sent_at = now()
WHERE
  user_id = $userId!
  AND invite_token_hash = $inviteTokenHash!
RETURNING
  user_id
;
