ALTER TABLE
  public.users
  ADD COLUMN invited_at timestamp with time zone
  , ADD COLUMN activated_at timestamp with time zone
  , ADD COLUMN deactivated_at timestamp with time zone
  , ADD CONSTRAINT activated_at_check CHECK (CASE WHEN activated_at IS NOT NULL THEN invited_at IS NOT NULL END)
	, ADD CONSTRAINT deactivated_at_check CHECK (CASE WHEN deactivated_at IS NOT NULL THEN invited_at IS NOT NULL AND activated_at IS NOT NULL END)
  ,DROP COLUMN is_active
;
