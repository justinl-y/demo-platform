INSERT INTO public.users
  (id, created_at, updated_at, customer_old_id, customer_id, locale, email, permissions, authentication_details, "password", first_name, last_name, company, "position", country, "state", city, main_phone, password_reset_key, auth_id_migrated, is_active)
VALUES
  (3730416874379281409, '2021-01-27 16:11:32.126', '2024-10-18 11:45:14.172', '1815617205937637031', 2705495386310575111, '{"tempConv": "f"}'::jsonb, 'jars-standard@semios.com', '{"level": 10}'::jsonb, '{}'::jsonb, '$2b$10$sAAgh3ITaRT6mBxDMPm09OTjCIXPHGrdr1.Cg6nppMzSEd6wsxwCG', 'Jars', 'Standard', 'Semios', 'Ghost in the machine', 'Canada', 'British Columbia', 'Vancouver', '+15551234567', '834667e85ce362f28fac0f0f2f5803f051ccf6fb', true, true)
  ,(3730416874379281410, '2021-01-27 16:11:32.126', '2024-10-18 11:45:14.172', '1815617205937637031', 2705495386310575111, '{"tempConv": "f"}'::jsonb, 'jars-admin@semios.com', '{"level": 20}'::jsonb, '{}'::jsonb, '$2b$10$sAAgh3ITaRT6mBxDMPm09OTjCIXPHGrdr1.Cg6nppMzSEd6wsxwCG', 'Jars', 'Administrator', 'Semios', 'Ghost in the machine', 'Canada', 'British Columbia', 'Vancouver', '+15551234567', '834667e85ce362f28fac0f0f2f5803f051ccf6fb', true, true),
  (3730416874379281411, '2021-01-27 16:11:32.126', '2024-10-18 11:45:14.172', '1815617205937637031', 2705495386310575111, '{"tempConv": "f"}'::jsonb, 'jars-super@semios.com', '{"level": 30}'::jsonb, '{}'::jsonb, '$2b$10$sAAgh3ITaRT6mBxDMPm09OTjCIXPHGrdr1.Cg6nppMzSEd6wsxwCG', 'Jars', 'Super', 'Semios', 'Ghost in the machine', 'Canada', 'British Columbia', 'Vancouver', '+15551234567', '834667e85ce362f28fac0f0f2f5803f051ccf6fb', true, true)
;  

INSERT INTO public.user_groups
  (group_id, user_id, is_active, created_at, updated_at)
VALUES
  (3062864550412945255, 3730416874379281409, true, '2025-09-03 20:18:15.877', '2025-09-03 20:18:15.877')
  ,(3086101457489889003, 3730416874379281409, true, '2025-08-28 20:40:34.920', '2025-08-28 20:40:34.920')
  ,(2512830824022279982, 3730416874379281409, true, '2025-08-27 17:30:52.289', '2025-08-27 17:30:52.289')
  ,(2512830824022279984, 3730416874379281410, true, '2025-08-27 17:26:06.218', '2025-08-27 17:26:06.218')
  ,(2512830824047445965, 3730416874379281410, true, '2025-08-21 16:55:29.161', '2025-08-21 16:55:29.161')
  ,(2535173819966948927, 3730416874379281410, true, '2025-08-20 21:07:33.705', '2025-08-20 21:07:33.705')
  ,(3104125309138503490, 3730416874379281411, true, '2025-08-20 21:07:33.680', '2025-08-20 21:07:33.680')
  ,(2705500165300552721, 3730416874379281411, true, '2025-08-20 21:07:00.047', '2025-08-20 21:07:00.047')
  ,(2847686452416873532, 3730416874379281411, true, '2025-08-20 21:06:34.419', '2025-08-20 21:06:34.419')
;
