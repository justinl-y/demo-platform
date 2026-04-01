CREATE OR REPLACE FUNCTION public.bcrypt(
  _password VARCHAR
)
RETURNS VARCHAR AS
$$
  -- choosing 4 because favouring performance over security for test scripts.
  SELECT crypt(_password, gen_salt('bf', 4));
$$
LANGUAGE SQL;

-------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.add_user (
  _email VARCHAR
  , _password VARCHAR DEFAULT NULL
  , _full_name VARCHAR DEFAULT NULL
  , _known_as VARCHAR DEFAULT NULL
  , _is_active BOOLEAN DEFAULT true
)
RETURNS BIGINT AS
$$
DECLARE
  v_unencrypted_password VARCHAR := COALESCE(_password, _email);
  v_encrypted_password VARCHAR := bcrypt(v_unencrypted_password);
  v_user_id BIGINT;
BEGIN
  INSERT INTO public.users
    (
      email
      , "password_hash"
      , full_name
      , known_as
      , is_active
    )
  VALUES
    (
      _email
      , v_encrypted_password
      , _full_name
      , _known_as
      , _is_active
    )
  RETURNING
    id
  INTO
    v_user_id
  ;

  RETURN v_user_id;
END
$$
LANGUAGE plpgsql
;

-------------------------------------------------------------------
