-- ============================================================
-- VoyageFleet — FULL SETUP SCRIPT
-- Paste this entire file into Supabase SQL Editor and click Run
-- ============================================================

-- ============================================================
-- STEP 1: Extensions
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- STEP 2: Enums
-- ============================================================

DO $$ BEGIN
  CREATE TYPE vehicle_status AS ENUM ('available','booked','on-journey','maintenance');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE driver_status AS ENUM ('available','on-duty','off');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE journey_status AS ENUM ('scheduled','ongoing','completed','cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE journey_detail AS ENUM ('at-origin','en-route','arrived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE booking_status AS ENUM ('confirmed','cancelled','completed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('user','admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- STEP 3: Tables
-- ============================================================

CREATE TABLE IF NOT EXISTS profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email        TEXT NOT NULL UNIQUE,
  full_name    TEXT NOT NULL,
  phone        TEXT,
  role         user_role NOT NULL DEFAULT 'user',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vehicles (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  make             TEXT NOT NULL,
  model            TEXT NOT NULL,
  year             INTEGER NOT NULL CHECK (year >= 1900 AND year <= 2100),
  license_plate    TEXT NOT NULL UNIQUE,
  capacity         INTEGER NOT NULL CHECK (capacity > 0),
  status           vehicle_status NOT NULL DEFAULT 'available',
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS drivers (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name        TEXT NOT NULL,
  license_number   TEXT NOT NULL UNIQUE,
  phone            TEXT NOT NULL,
  status           driver_status NOT NULL DEFAULT 'available',
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vehicle_assignments (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id      UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  driver_id       UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  is_current      BOOLEAN NOT NULL DEFAULT true,
  assigned_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  unassigned_at   TIMESTAMPTZ,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Unique partial index to enforce one active assignment per vehicle
CREATE UNIQUE INDEX IF NOT EXISTS uq_current_vehicle_assignment
  ON vehicle_assignments (vehicle_id)
  WHERE (is_current = true);

CREATE TABLE IF NOT EXISTS journeys (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id       UUID NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,
  driver_id        UUID NOT NULL REFERENCES drivers(id) ON DELETE RESTRICT,
  origin           TEXT NOT NULL,
  destination      TEXT NOT NULL,
  departure_time   TIMESTAMPTZ NOT NULL,
  arrival_time     TIMESTAMPTZ NOT NULL,
  status           journey_status NOT NULL DEFAULT 'scheduled',
  detail           journey_detail NOT NULL DEFAULT 'at-origin',
  fare             NUMERIC(10, 2) NOT NULL CHECK (fare >= 0),
  available_seats  INTEGER NOT NULL CHECK (available_seats >= 0),
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT arrival_after_departure CHECK (arrival_time > departure_time)
);

CREATE TABLE IF NOT EXISTS bookings (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  journey_id   UUID NOT NULL REFERENCES journeys(id) ON DELETE RESTRICT,
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  seats        INTEGER NOT NULL DEFAULT 1 CHECK (seats > 0),
  status       booking_status NOT NULL DEFAULT 'confirmed',
  booked_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  cancelled_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- STEP 4: Indexes
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_profiles_role        ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email       ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_vehicles_status      ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_license     ON vehicles(license_plate);
CREATE INDEX IF NOT EXISTS idx_drivers_status       ON drivers(status);
CREATE INDEX IF NOT EXISTS idx_drivers_license      ON drivers(license_number);
CREATE INDEX IF NOT EXISTS idx_assignments_vehicle  ON vehicle_assignments(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_assignments_driver   ON vehicle_assignments(driver_id);
CREATE INDEX IF NOT EXISTS idx_journeys_status      ON journeys(status);
CREATE INDEX IF NOT EXISTS idx_journeys_departure   ON journeys(departure_time);
CREATE INDEX IF NOT EXISTS idx_journeys_vehicle     ON journeys(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_journeys_driver      ON journeys(driver_id);
CREATE INDEX IF NOT EXISTS idx_journeys_origin      ON journeys(origin);
CREATE INDEX IF NOT EXISTS idx_journeys_destination ON journeys(destination);
CREATE INDEX IF NOT EXISTS idx_bookings_user        ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_journey     ON bookings(journey_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status      ON bookings(status);

-- ============================================================
-- STEP 5: Row Level Security
-- ============================================================

ALTER TABLE profiles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers             ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE journeys            ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings            ENABLE ROW LEVEL SECURITY;

-- Admin helper (SECURITY DEFINER avoids infinite RLS recursion)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- profiles
DROP POLICY IF EXISTS "profiles_select_own"     ON profiles;
DROP POLICY IF EXISTS "profiles_select_admin"   ON profiles;
DROP POLICY IF EXISTS "profiles_update_own"     ON profiles;
DROP POLICY IF EXISTS "profiles_update_admin"   ON profiles;
DROP POLICY IF EXISTS "profiles_insert_service" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_admin"   ON profiles;

CREATE POLICY "profiles_select_own"     ON profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "profiles_select_admin"   ON profiles FOR SELECT USING (is_admin());
CREATE POLICY "profiles_update_own"     ON profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "profiles_update_admin"   ON profiles FOR UPDATE USING (is_admin());
CREATE POLICY "profiles_insert_service" ON profiles FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_delete_admin"   ON profiles FOR DELETE USING (is_admin());

-- vehicles
DROP POLICY IF EXISTS "vehicles_select_authenticated" ON vehicles;
DROP POLICY IF EXISTS "vehicles_insert_admin"         ON vehicles;
DROP POLICY IF EXISTS "vehicles_update_admin"         ON vehicles;
DROP POLICY IF EXISTS "vehicles_delete_admin"         ON vehicles;

CREATE POLICY "vehicles_select_authenticated" ON vehicles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "vehicles_insert_admin"         ON vehicles FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "vehicles_update_admin"         ON vehicles FOR UPDATE USING (is_admin());
CREATE POLICY "vehicles_delete_admin"         ON vehicles FOR DELETE USING (is_admin());

-- drivers
DROP POLICY IF EXISTS "drivers_select_authenticated" ON drivers;
DROP POLICY IF EXISTS "drivers_insert_admin"         ON drivers;
DROP POLICY IF EXISTS "drivers_update_admin"         ON drivers;
DROP POLICY IF EXISTS "drivers_delete_admin"         ON drivers;

CREATE POLICY "drivers_select_authenticated" ON drivers FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "drivers_insert_admin"         ON drivers FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "drivers_update_admin"         ON drivers FOR UPDATE USING (is_admin());
CREATE POLICY "drivers_delete_admin"         ON drivers FOR DELETE USING (is_admin());

-- vehicle_assignments
DROP POLICY IF EXISTS "assignments_select_authenticated" ON vehicle_assignments;
DROP POLICY IF EXISTS "assignments_insert_admin"         ON vehicle_assignments;
DROP POLICY IF EXISTS "assignments_update_admin"         ON vehicle_assignments;
DROP POLICY IF EXISTS "assignments_delete_admin"         ON vehicle_assignments;

CREATE POLICY "assignments_select_authenticated" ON vehicle_assignments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "assignments_insert_admin"         ON vehicle_assignments FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "assignments_update_admin"         ON vehicle_assignments FOR UPDATE USING (is_admin());
CREATE POLICY "assignments_delete_admin"         ON vehicle_assignments FOR DELETE USING (is_admin());

-- journeys
DROP POLICY IF EXISTS "journeys_select_authenticated" ON journeys;
DROP POLICY IF EXISTS "journeys_insert_admin"         ON journeys;
DROP POLICY IF EXISTS "journeys_update_admin"         ON journeys;
DROP POLICY IF EXISTS "journeys_delete_admin"         ON journeys;

CREATE POLICY "journeys_select_authenticated" ON journeys FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "journeys_insert_admin"         ON journeys FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "journeys_update_admin"         ON journeys FOR UPDATE USING (is_admin());
CREATE POLICY "journeys_delete_admin"         ON journeys FOR DELETE USING (is_admin());

-- bookings
DROP POLICY IF EXISTS "bookings_select_own"    ON bookings;
DROP POLICY IF EXISTS "bookings_select_admin"  ON bookings;
DROP POLICY IF EXISTS "bookings_insert_own"    ON bookings;
DROP POLICY IF EXISTS "bookings_update_own"    ON bookings;
DROP POLICY IF EXISTS "bookings_update_admin"  ON bookings;
DROP POLICY IF EXISTS "bookings_delete_admin"  ON bookings;

CREATE POLICY "bookings_select_own"   ON bookings FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "bookings_select_admin" ON bookings FOR SELECT USING (is_admin());
CREATE POLICY "bookings_insert_own"   ON bookings FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "bookings_update_own"   ON bookings FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "bookings_update_admin" ON bookings FOR UPDATE USING (is_admin());
CREATE POLICY "bookings_delete_admin" ON bookings FOR DELETE USING (is_admin());

-- ============================================================
-- STEP 6: Triggers
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_updated_at    ON profiles;
DROP TRIGGER IF EXISTS trg_vehicles_updated_at    ON vehicles;
DROP TRIGGER IF EXISTS trg_drivers_updated_at     ON drivers;
DROP TRIGGER IF EXISTS trg_assignments_updated_at ON vehicle_assignments;
DROP TRIGGER IF EXISTS trg_journeys_updated_at    ON journeys;
DROP TRIGGER IF EXISTS trg_bookings_updated_at    ON bookings;

CREATE TRIGGER trg_profiles_updated_at    BEFORE UPDATE ON profiles            FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_vehicles_updated_at    BEFORE UPDATE ON vehicles             FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_drivers_updated_at     BEFORE UPDATE ON drivers              FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_assignments_updated_at BEFORE UPDATE ON vehicle_assignments  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_journeys_updated_at    BEFORE UPDATE ON journeys             FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_bookings_updated_at    BEFORE UPDATE ON bookings             FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    'user'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_on_auth_user_created ON auth.users;
CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_auth_user();

-- ============================================================
-- STEP 7: Seed Data
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
  ('Volkswagen', 'Crafter',      2020, 'KCH 008H', 18, 'available',   'School run vehicle')
ON CONFLICT (license_plate) DO NOTHING;

INSERT INTO drivers (full_name, license_number, phone, status, notes)
VALUES
  ('James Otieno',  'DL-KE-100001', '+254700000001', 'available', 'Senior driver, 10 years exp.'),
  ('Mary Wanjiku',  'DL-KE-100002', '+254700000002', 'available', 'Certified PSV driver'),
  ('Peter Kamau',   'DL-KE-100003', '+254700000003', 'available', 'Handles airport routes'),
  ('Grace Akinyi',  'DL-KE-100004', '+254700000004', 'on-duty',   'Currently on assigned route'),
  ('Samuel Mutua',  'DL-KE-100005', '+254700000005', 'available', 'Night shift specialist'),
  ('Fatuma Hassan', 'DL-KE-100006', '+254700000006', 'off',       'Rest day today')
ON CONFLICT (license_number) DO NOTHING;

INSERT INTO vehicle_assignments (vehicle_id, driver_id, is_current, notes)
VALUES
  ((SELECT id FROM vehicles WHERE license_plate = 'KCA 001A'), (SELECT id FROM drivers WHERE license_number = 'DL-KE-100001'), true, 'Primary assignment'),
  ((SELECT id FROM vehicles WHERE license_plate = 'KCB 002B'), (SELECT id FROM drivers WHERE license_number = 'DL-KE-100002'), true, 'Primary assignment'),
  ((SELECT id FROM vehicles WHERE license_plate = 'KCC 003C'), (SELECT id FROM drivers WHERE license_number = 'DL-KE-100003'), true, 'Airport transfer route'),
  ((SELECT id FROM vehicles WHERE license_plate = 'KCF 006F'), (SELECT id FROM drivers WHERE license_number = 'DL-KE-100004'), true, 'Currently on duty')
ON CONFLICT DO NOTHING;

INSERT INTO journeys (vehicle_id, driver_id, origin, destination, departure_time, arrival_time, status, detail, fare, available_seats, notes)
VALUES
  (
    (SELECT id FROM vehicles WHERE license_plate = 'KCA 001A'),
    (SELECT id FROM drivers  WHERE license_number = 'DL-KE-100001'),
    'Nairobi CBD', 'Mombasa',
    now() + INTERVAL '2 days', now() + INTERVAL '2 days 8 hours',
    'scheduled', 'at-origin', 1200.00, 12, 'Direct overnight express'
  ),
  (
    (SELECT id FROM vehicles WHERE license_plate = 'KCB 002B'),
    (SELECT id FROM drivers  WHERE license_number = 'DL-KE-100002'),
    'Nairobi CBD', 'Kisumu',
    now() + INTERVAL '3 days', now() + INTERVAL '3 days 6 hours',
    'scheduled', 'at-origin', 900.00, 18, 'Executive service'
  ),
  (
    (SELECT id FROM vehicles WHERE license_plate = 'KCC 003C'),
    (SELECT id FROM drivers  WHERE license_number = 'DL-KE-100003'),
    'JKIA Airport', 'Nairobi CBD',
    now() + INTERVAL '1 day', now() + INTERVAL '1 day 1 hour',
    'scheduled', 'at-origin', 400.00, 10, 'Airport transfer'
  ),
  (
    (SELECT id FROM vehicles WHERE license_plate = 'KCF 006F'),
    (SELECT id FROM drivers  WHERE license_number = 'DL-KE-100004'),
    'Nairobi CBD', 'Nakuru',
    now() - INTERVAL '2 hours', now() + INTERVAL '2 hours',
    'ongoing', 'en-route', 600.00, 0, 'Currently en route'
  ),
  (
    (SELECT id FROM vehicles WHERE license_plate = 'KCG 007G'),
    (SELECT id FROM drivers  WHERE license_number = 'DL-KE-100005'),
    'Nairobi CBD', 'Eldoret',
    now() - INTERVAL '3 days', now() - INTERVAL '3 days' + INTERVAL '5 hours',
    'completed', 'arrived', 1100.00, 0, 'Journey completed'
  ),
  (
    (SELECT id FROM vehicles WHERE license_plate = 'KCH 008H'),
    (SELECT id FROM drivers  WHERE license_number = 'DL-KE-100001'),
    'Nairobi CBD', 'Thika',
    now() + INTERVAL '5 days', now() + INTERVAL '5 days 1 hour',
    'scheduled', 'at-origin', 250.00, 16, 'Short commuter route'
  );

-- ============================================================
-- SETUP COMPLETE
-- Verify with:
--   SELECT count(*) FROM vehicles;    -- 8
--   SELECT count(*) FROM drivers;     -- 6
--   SELECT count(*) FROM journeys;    -- 6
-- ============================================================
