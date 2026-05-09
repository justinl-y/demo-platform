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

CREATE TYPE public.user_status AS ENUM (
  'CREATED'
  , 'INVITED'
  , 'ACTIVE'
  , 'DEACTIVATED'
);

-------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.add_user (
  _email VARCHAR
  , _password VARCHAR DEFAULT NULL
  , _full_name VARCHAR DEFAULT NULL
  , _known_as VARCHAR DEFAULT NULL
  , _status public.user_status DEFAULT 'ACTIVE'
)
RETURNS UUID AS
$$
DECLARE
  v_unencrypted_password VARCHAR := COALESCE(_password, _email);
  v_encrypted_password VARCHAR := bcrypt(v_unencrypted_password);
  v_user_id UUID;

  v_current_timestamp timestamptz := now();
  v_invited_at timestamptz := v_current_timestamp + INTERVAL '5 minutes';
  v_activated_at timestamptz := v_current_timestamp + INTERVAL '10 minutes';
  v_deactivated_at timestamptz := v_current_timestamp + INTERVAL '15 minutes';
BEGIN
  INSERT INTO public.users
    (
      email
      , "password_hash"
      , full_name
      , known_as
      , invited_at
      , activated_at
      , deactivated_at
    )
  VALUES
    (
      _email
      , v_encrypted_password
      , _full_name
      , _known_as
      , CASE WHEN _status IN ('INVITED', 'ACTIVE', 'DEACTIVATED') THEN v_invited_at END
      , CASE WHEN _status IN ('ACTIVE', 'DEACTIVATED') THEN v_activated_at END
      , CASE WHEN _status = 'DEACTIVATED' THEN v_deactivated_at END
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
