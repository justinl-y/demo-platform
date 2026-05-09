ALTER TABLE
  public.users
  ADD COLUMN status text GENERATED ALWAYS AS (
    CASE
      WHEN (invited_at IS NULL AND activated_at IS NULL AND deactivated_at IS NULL) THEN 'CREATED'
      WHEN (invited_at IS NOT NULL AND activated_at IS NULL AND deactivated_at IS NULL) THEN 'INVITED'
      WHEN (invited_at IS NOT NULL AND activated_at IS NOT NULL AND deactivated_at IS NULL) THEN 'ACTIVE'
      WHEN (invited_at IS NOT NULL AND activated_at IS NOT NULL AND deactivated_at IS NOT NULL) THEN 'DEACTIVATED'
    END
  ) STORED
;

CREATE INDEX users_status_idx ON public.users (status);
