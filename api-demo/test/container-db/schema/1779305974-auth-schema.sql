CREATE TABLE public.users_authentication (
  user_id uuid PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE
  , password_hash varchar(255) NULL
  , password_reset_token_hash varchar(255) NULL UNIQUE
  , refresh_token_hash varchar(255) NULL UNIQUE
  , last_login timestamptz NULL
);

ALTER TABLE public.users
  DROP COLUMN password_hash
  , DROP COLUMN token_password_reset_hash
  , DROP COLUMN token_refresh_hash
  , DROP COLUMN last_login
;

-- functions
CREATE OR REPLACE FUNCTION public.fn_create_users_authentication_row()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users_authentication (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- triggers
CREATE TRIGGER trg_create_users_authentication_row
AFTER INSERT ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.fn_create_users_authentication_row();
