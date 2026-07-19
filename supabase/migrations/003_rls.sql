-- ============================================================
-- Vehicle Journey Booking System — Row Level Security
-- Migration: 003_rls.sql
-- ============================================================

-- ============================================================
-- Enable RLS on all tables
-- ============================================================

ALTER TABLE profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers            ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE journeys           ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings           ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Helper: determine if the current user is an admin
-- Uses security definer so it can read profiles without
-- triggering an infinite RLS loop on the profiles table.
-- ============================================================

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  );
END;
$$;

-- ============================================================
-- PROFILES
-- ============================================================

-- Users read their own profile
CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  USING (id = auth.uid());

-- Admins read all profiles
CREATE POLICY "profiles_select_admin"
  ON profiles FOR SELECT
  USING (is_admin());

-- Users update their own profile (limited fields enforced at app layer)
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

-- Admins update any profile
CREATE POLICY "profiles_update_admin"
  ON profiles FOR UPDATE
  USING (is_admin());

-- Profile is created by the signup trigger (runs as service role),
-- so INSERT is handled by the trigger function, not by the user directly.
CREATE POLICY "profiles_insert_service"
  ON profiles FOR INSERT
  WITH CHECK (id = auth.uid());

-- Admins can delete profiles (rare; cascade removes auth user too)
CREATE POLICY "profiles_delete_admin"
  ON profiles FOR DELETE
  USING (is_admin());

-- ============================================================
-- VEHICLES
-- ============================================================

-- All authenticated users can view vehicles
CREATE POLICY "vehicles_select_authenticated"
  ON vehicles FOR SELECT
  USING (auth.role() = 'authenticated');

-- Only admins can insert / update / delete
CREATE POLICY "vehicles_insert_admin"
  ON vehicles FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "vehicles_update_admin"
  ON vehicles FOR UPDATE
  USING (is_admin());

CREATE POLICY "vehicles_delete_admin"
  ON vehicles FOR DELETE
  USING (is_admin());

-- ============================================================
-- DRIVERS
-- ============================================================

-- All authenticated users can view drivers
CREATE POLICY "drivers_select_authenticated"
  ON drivers FOR SELECT
  USING (auth.role() = 'authenticated');

-- Only admins can insert / update / delete
CREATE POLICY "drivers_insert_admin"
  ON drivers FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "drivers_update_admin"
  ON drivers FOR UPDATE
  USING (is_admin());

CREATE POLICY "drivers_delete_admin"
  ON drivers FOR DELETE
  USING (is_admin());

-- ============================================================
-- VEHICLE ASSIGNMENTS
-- ============================================================

-- All authenticated users can view assignments (needed to display who drives what)
CREATE POLICY "assignments_select_authenticated"
  ON vehicle_assignments FOR SELECT
  USING (auth.role() = 'authenticated');

-- Only admins manage assignments
CREATE POLICY "assignments_insert_admin"
  ON vehicle_assignments FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "assignments_update_admin"
  ON vehicle_assignments FOR UPDATE
  USING (is_admin());

CREATE POLICY "assignments_delete_admin"
  ON vehicle_assignments FOR DELETE
  USING (is_admin());

-- ============================================================
-- JOURNEYS
-- ============================================================

-- All authenticated users can view journeys
CREATE POLICY "journeys_select_authenticated"
  ON journeys FOR SELECT
  USING (auth.role() = 'authenticated');

-- Only admins can insert / update / delete
CREATE POLICY "journeys_insert_admin"
  ON journeys FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "journeys_update_admin"
  ON journeys FOR UPDATE
  USING (is_admin());

CREATE POLICY "journeys_delete_admin"
  ON journeys FOR DELETE
  USING (is_admin());

-- ============================================================
-- BOOKINGS
-- ============================================================

-- Users see only their own bookings
CREATE POLICY "bookings_select_own"
  ON bookings FOR SELECT
  USING (user_id = auth.uid());

-- Admins see all bookings
CREATE POLICY "bookings_select_admin"
  ON bookings FOR SELECT
  USING (is_admin());

-- Users can create a booking for themselves only
CREATE POLICY "bookings_insert_own"
  ON bookings FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own booking (to cancel it; business rules enforced at app layer)
CREATE POLICY "bookings_update_own"
  ON bookings FOR UPDATE
  USING (user_id = auth.uid());

-- Admins can update any booking
CREATE POLICY "bookings_update_admin"
  ON bookings FOR UPDATE
  USING (is_admin());

-- Admins can delete bookings
CREATE POLICY "bookings_delete_admin"
  ON bookings FOR DELETE
  USING (is_admin());
