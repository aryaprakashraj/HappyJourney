-- ============================================================
-- Vehicle Journey Booking System — Seed Data
-- Migration: 005_seed.sql
-- ============================================================
-- NOTE: Run this AFTER registering your first admin account via
-- Supabase Auth UI / API. Replace the placeholder UUIDs below
-- with real auth.users UUIDs from your Supabase dashboard.
--
-- To use:
--   1. Create a user via Supabase Auth (Dashboard > Auth > Users > Invite)
--   2. Copy the UUID of that user
--   3. Update the profiles INSERT below with the real UUID & email
--   4. Run this file in the Supabase SQL editor
-- ============================================================

-- ============================================================
-- Vehicles (8 records)
-- ============================================================

INSERT INTO vehicles (make, model, year, license_plate, capacity, status, notes)
VALUES
  ('Toyota',     'HiAce',        2021, 'KCA 001A', 14, 'available',   'Long-distance minibus'),
  ('Mercedes',   'Sprinter',     2022, 'KCB 002B', 20, 'available',   'Executive coach'),
  ('Ford',       'Transit',      2020, 'KCC 003C', 12, 'available',   'City shuttle'),
  ('Isuzu',      'NQR',          2019, 'KCD 004D', 30, 'available',   'Standard bus'),
  ('Toyota',     'Coaster',      2023, 'KCE 005E', 26, 'maintenance', 'Under scheduled servicing'),
  ('Nissan',     'NV350 Urvan',  2021, 'KCF 006F', 12, 'available',   'Airport transfer'),
  ('Hyundai',    'H350',         2022, 'KCG 007G', 16, 'available',   'Corporate shuttle'),
  ('Volkswagen', 'Crafter',      2020, 'KCH 008H', 18, 'available',   'School run vehicle');

-- ============================================================
-- Drivers (6 records)
-- ============================================================

INSERT INTO drivers (full_name, license_number, phone, status, notes)
VALUES
  ('James Otieno',   'DL-KE-100001', '+254700000001', 'available', 'Senior driver, 10 years exp.'),
  ('Mary Wanjiku',   'DL-KE-100002', '+254700000002', 'available', 'Certified PSV driver'),
  ('Peter Kamau',    'DL-KE-100003', '+254700000003', 'available', 'Handles airport routes'),
  ('Grace Akinyi',   'DL-KE-100004', '+254700000004', 'on-duty',   'Currently on assigned route'),
  ('Samuel Mutua',   'DL-KE-100005', '+254700000005', 'available', 'Night shift specialist'),
  ('Fatuma Hassan',  'DL-KE-100006', '+254700000006', 'off',       'Rest day today');

-- ============================================================
-- Vehicle Assignments
-- Assign drivers to vehicles (current assignments only)
-- ============================================================

INSERT INTO vehicle_assignments (vehicle_id, driver_id, is_current, notes)
VALUES
  (
    (SELECT id FROM vehicles WHERE license_plate = 'KCA 001A'),
    (SELECT id FROM drivers  WHERE license_number = 'DL-KE-100001'),
    true,
    'Primary assignment'
  ),
  (
    (SELECT id FROM vehicles WHERE license_plate = 'KCB 002B'),
    (SELECT id FROM drivers  WHERE license_number = 'DL-KE-100002'),
    true,
    'Primary assignment'
  ),
  (
    (SELECT id FROM vehicles WHERE license_plate = 'KCC 003C'),
    (SELECT id FROM drivers  WHERE license_number = 'DL-KE-100003'),
    true,
    'Airport transfer route'
  ),
  (
    (SELECT id FROM vehicles WHERE license_plate = 'KCF 006F'),
    (SELECT id FROM drivers  WHERE license_number = 'DL-KE-100004'),
    true,
    'Grace currently on duty with this vehicle'
  );

-- ============================================================
-- Journeys (6 records — mix of statuses for testing)
-- ============================================================

INSERT INTO journeys (vehicle_id, driver_id, origin, destination, departure_time, arrival_time, status, detail, fare, available_seats, notes)
VALUES
  (
    (SELECT id FROM vehicles WHERE license_plate = 'KCA 001A'),
    (SELECT id FROM drivers  WHERE license_number = 'DL-KE-100001'),
    'Nairobi CBD',
    'Mombasa',
    now() + INTERVAL '2 days',
    now() + INTERVAL '2 days 8 hours',
    'scheduled',
    'at-origin',
    1200.00,
    12,
    'Direct overnight express'
  ),
  (
    (SELECT id FROM vehicles WHERE license_plate = 'KCB 002B'),
    (SELECT id FROM drivers  WHERE license_number = 'DL-KE-100002'),
    'Nairobi CBD',
    'Kisumu',
    now() + INTERVAL '3 days',
    now() + INTERVAL '3 days 6 hours',
    'scheduled',
    'at-origin',
    900.00,
    18,
    'Executive service'
  ),
  (
    (SELECT id FROM vehicles WHERE license_plate = 'KCC 003C'),
    (SELECT id FROM drivers  WHERE license_number = 'DL-KE-100003'),
    'JKIA Airport',
    'Nairobi CBD',
    now() + INTERVAL '1 day',
    now() + INTERVAL '1 day 1 hour',
    'scheduled',
    'at-origin',
    400.00,
    10,
    'Airport transfer'
  ),
  (
    (SELECT id FROM vehicles WHERE license_plate = 'KCF 006F'),
    (SELECT id FROM drivers  WHERE license_number = 'DL-KE-100004'),
    'Nairobi CBD',
    'Nakuru',
    now() - INTERVAL '2 hours',
    now() + INTERVAL '2 hours',
    'ongoing',
    'en-route',
    600.00,
    0,
    'Currently en route'
  ),
  (
    (SELECT id FROM vehicles WHERE license_plate = 'KCG 007G'),
    (SELECT id FROM drivers  WHERE license_number = 'DL-KE-100005'),
    'Nairobi CBD',
    'Eldoret',
    now() - INTERVAL '3 days',
    now() - INTERVAL '3 days' + INTERVAL '5 hours',
    'completed',
    'arrived',
    1100.00,
    0,
    'Journey completed'
  ),
  (
    (SELECT id FROM vehicles WHERE license_plate = 'KCH 008H'),
    (SELECT id FROM drivers  WHERE license_number = 'DL-KE-100001'),
    'Nairobi CBD',
    'Thika',
    now() + INTERVAL '5 days',
    now() + INTERVAL '5 days 1 hour',
    'scheduled',
    'at-origin',
    250.00,
    16,
    'Short commuter route'
  );

-- ============================================================
-- ADMIN USER SETUP
-- ============================================================
-- After this seed runs, you need to manually promote your
-- first admin. Run the statement below, replacing the email
-- with your actual admin account email:
--
--   UPDATE profiles
--   SET role = 'admin'
--   WHERE email = 'admin@yourdomain.com';
--
-- Admin accounts should NEVER be created via the public signup
-- form. Use the Supabase dashboard or the UPDATE above.
-- ============================================================
