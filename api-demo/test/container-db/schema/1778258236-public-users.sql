CREATE TYPE public.user_status AS ENUM (
  'CREATED'
  , 'INVITED'
  , 'ACTIVE'
  , 'DEACTIVATED'
);

ALTER TABLE
  public.users
  ALTER COLUMN password_hash DROP NOT NULL
  , ADD COLUMN invited_at timestamp with time zone
  , ADD COLUMN activated_at timestamp with time zone
  , ADD COLUMN deactivated_at timestamp with time zone
  , ADD CONSTRAINT password_hash_check CHECK (activated_at IS NULL OR password_hash IS NOT NULL)
  , ADD CONSTRAINT timestamptz_check CHECK (
      (invited_at IS NULL AND activated_at IS NULL AND deactivated_at IS NULL)
      OR
      (invited_at IS NOT NULL AND (activated_at IS NULL AND deactivated_at IS NULL) AND invited_at > created_at)
      OR
      (invited_at IS NOT NULL AND (activated_at IS NOT NULL AND deactivated_at IS NULL) AND activated_at > invited_at AND invited_at > created_at)
      OR
      (invited_at IS NOT NULL AND (activated_at IS NOT NULL AND deactivated_at IS NOT NULL) AND deactivated_at > activated_at AND invited_at > created_at)
  )
  , ADD COLUMN status public.user_status GENERATED ALWAYS AS (
    CASE
      WHEN (invited_at IS NULL AND activated_at IS NULL AND deactivated_at IS NULL) THEN 'CREATED'::public.user_status
      WHEN (invited_at IS NOT NULL AND activated_at IS NULL AND deactivated_at IS NULL) THEN 'INVITED'::public.user_status
      WHEN (invited_at IS NOT NULL AND activated_at IS NOT NULL AND deactivated_at IS NULL) THEN 'ACTIVE'::public.user_status
      WHEN (invited_at IS NOT NULL AND activated_at IS NOT NULL AND deactivated_at IS NOT NULL) THEN 'DEACTIVATED'::public.user_status
    END
  ) STORED NOT NULL
  , DROP COLUMN is_active
;

CREATE INDEX users_status_idx ON public.users (status);
