SELECT
  public.add_user(email, pwd, full_name, known_as, status)
FROM
  (VALUES
    ('user.super@email.com', 'user.super@email.com', 'Super User', 'Super', 'ACTIVE'),
    ('alice.smith@example.com', 'password1', 'Alice Smith', 'Ali', 'ACTIVE'),
    ('bob.johnson@example.com', 'password2', 'Bob Johnson', 'Bobby', 'ACTIVE'),
    ('carol.williams@example.com', 'password3', 'Carol Williams', NULL, 'ACTIVE'),
    ('david.brown@example.com', 'password4', 'David Brown', 'Dave', 'ACTIVE'),
    ('eve.jones@example.com', 'password5', 'Eve Jones', NULL, 'ACTIVE'),
    ('frank.miller@example.com', 'password6', 'Frank Miller', 'Frankie', 'ACTIVE'),
    ('grace.davis@example.com', 'password7', 'Grace Davis', 'Gracie', 'ACTIVE'),
    ('henry.garcia@example.com', 'password8', 'Henry Garcia', 'Hank', 'ACTIVE'),
    ('irene.martinez@example.com', 'password9', 'Irene Martinez', 'Ivy', 'ACTIVE'),
    ('jack.rodriguez@example.com', 'password10', 'Jack Rodriguez', 'J.R.', 'ACTIVE')
  ) AS u
  (email, pwd, full_name, known_as, status)
;
