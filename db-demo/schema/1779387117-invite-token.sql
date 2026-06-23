ALTER TABLE public.users_authentication
  ADD COLUMN invite_token_hash varchar(255) UNIQUE
  , ADD COLUMN invite_token_expiry_at timestamptz
  , ADD COLUMN invite_email_sent_at timestamptz
;
