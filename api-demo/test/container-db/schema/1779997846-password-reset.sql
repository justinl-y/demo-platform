ALTER TABLE public.users_authentication
  ADD COLUMN password_reset_token_expiry_at timestamptz NULL
  , ADD COLUMN password_reset_email_sent_at timestamptz NULL
;
