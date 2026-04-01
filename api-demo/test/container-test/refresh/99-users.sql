INSERT INTO public.users
  (email, password_hash, full_name, known_as)
VALUES
  ('alice.smith@example.com', public.bcrypt('password1'), 'Alice Smith', 'Ali')
  , ('bob.johnson@example.com', public.bcrypt('password2'), 'Bob Johnson', 'Bobby')
  , ('carol.williams@example.com', public.bcrypt('password3'), 'Carol Williams', NULL)
  , ('david.brown@example.com', public.bcrypt('password4'), 'David Brown', 'Dave')
  , ('eve.jones@example.com', public.bcrypt('password5'), 'Eve Jones', NULL)
  , ('frank.miller@example.com', public.bcrypt('password6'), 'Frank Miller', 'Frankie')
  , ('grace.davis@example.com', public.bcrypt('password7'), 'Grace Davis', 'Gracie')
  , ('henry.garcia@example.com', public.bcrypt('password8'), 'Henry Garcia', 'Hank')
  , ('irene.martinez@example.com', public.bcrypt('password9'), 'Irene Martinez', 'Ivy')
  , ('jack.rodriguez@example.com', public.bcrypt('password10'), 'Jack Rodriguez', 'J.R.')
;
