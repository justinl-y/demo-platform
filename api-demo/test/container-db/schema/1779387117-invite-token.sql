ALTER TABLE public.users_authentication
  ADD COLUMN invite_token_hash varchar(255) UNIQUE
  , ADD COLUMN invite_token_expiry_at timestamptz
;
