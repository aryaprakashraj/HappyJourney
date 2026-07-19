-- ============================================================
-- Vehicle Journey Booking System — Initial Schema
-- Migration: 001_initial_schema.sql
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE vehicle_status AS ENUM (
  'available',
  'booked',
  'on-journey',
  'maintenance'
);

CREATE TYPE driver_status AS ENUM (
  'available',
  'on-duty',
  'off'
);

CREATE TYPE journey_status AS ENUM (
  'scheduled',
  'ongoing',
  'completed',
  'cancelled'
);

CREATE TYPE journey_detail AS ENUM (
  'at-origin',
  'en-route',
  'arrived'
);

CREATE TYPE booking_status AS ENUM (
  'confirmed',
  'cancelled',
  'completed'
);

CREATE TYPE user_role AS ENUM (
  'user',
  'admin'
);

-- ============================================================
-- PROFILES
-- One profile per auth.users row. Created via trigger on signup.
-- ============================================================

CREATE TABLE profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email        TEXT NOT NULL UNIQUE,
  full_name    TEXT NOT NULL,
  phone        TEXT,
  role         user_role NOT NULL DEFAULT 'user',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- VEHICLES
-- ============================================================

CREATE TABLE vehicles (
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

-- ============================================================
-- DRIVERS
-- ============================================================

CREATE TABLE drivers (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name        TEXT NOT NULL,
  license_number   TEXT NOT NULL UNIQUE,
  phone            TEXT NOT NULL,
  status           driver_status NOT NULL DEFAULT 'available',
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- VEHICLE ASSIGNMENTS
-- Tracks which driver is assigned to which vehicle.
-- History is preserved; only one assignment per vehicle where is_current = true.
-- ============================================================

CREATE TABLE vehicle_assignments (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id      UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  driver_id       UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  is_current      BOOLEAN NOT NULL DEFAULT true,
  assigned_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  unassigned_at   TIMESTAMPTZ,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Enforce at most one current assignment per vehicle at the DB level
  CONSTRAINT unique_current_vehicle_assignment
    EXCLUDE USING btree (vehicle_id WITH =)
    WHERE (is_current = true)
);

-- ============================================================
-- JOURNEYS
-- ============================================================

CREATE TABLE journeys (
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

  CONSTRAINT arrival_after_departure
    CHECK (arrival_time > departure_time)
);

-- ============================================================
-- BOOKINGS
-- ============================================================

CREATE TABLE bookings (
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
