CREATE TYPE public.user_status AS ENUM (
  'CREATED'
  , 'INVITED'
  , 'ACTIVE'
  , 'DEACTIVATED'
);

ALTER TABLE
  public.users
  ADD COLUMN invited_at timestamp with time zone
  , ADD COLUMN activated_at timestamp with time zone
  , ADD COLUMN deactivated_at timestamp with time zone
  , ADD CONSTRAINT timestamptz_check CHECK (
      (invited_at IS NULL AND activated_at IS NULL AND deactivated_at IS NULL)
      OR
      (invited_at IS NOT NULL AND (activated_at IS NULL AND deactivated_at IS NULL) AND invited_at > created_at)
      OR
      (invited_at IS NOT NULL AND (activated_at IS NOT NULL AND deactivated_at IS NULL) AND activated_at > invited_at AND invited_at > created_at)
      OR
      (invited_at IS NOT NULL AND (activated_at IS NOT NULL AND deactivated_at IS NOT NULL) AND deactivated_at > activated_at AND invited_at > created_at)
  )
  ,DROP COLUMN is_active
;
