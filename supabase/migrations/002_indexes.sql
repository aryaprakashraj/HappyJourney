-- ============================================================
-- Vehicle Journey Booking System — Indexes
-- Migration: 002_indexes.sql
-- ============================================================

-- Profiles
CREATE INDEX idx_profiles_role         ON profiles(role);
CREATE INDEX idx_profiles_email        ON profiles(email);

-- Vehicles
CREATE INDEX idx_vehicles_status       ON vehicles(status);
CREATE INDEX idx_vehicles_license      ON vehicles(license_plate);

-- Drivers
CREATE INDEX idx_drivers_status        ON drivers(status);
CREATE INDEX idx_drivers_license       ON drivers(license_number);

-- Vehicle Assignments
CREATE INDEX idx_assignments_vehicle   ON vehicle_assignments(vehicle_id);
CREATE INDEX idx_assignments_driver    ON vehicle_assignments(driver_id);
CREATE INDEX idx_assignments_current   ON vehicle_assignments(vehicle_id, is_current) WHERE (is_current = true);

-- Journeys
CREATE INDEX idx_journeys_status       ON journeys(status);
CREATE INDEX idx_journeys_departure    ON journeys(departure_time);
CREATE INDEX idx_journeys_vehicle      ON journeys(vehicle_id);
CREATE INDEX idx_journeys_driver       ON journeys(driver_id);
CREATE INDEX idx_journeys_origin       ON journeys(origin);
CREATE INDEX idx_journeys_destination  ON journeys(destination);

-- Bookings
CREATE INDEX idx_bookings_user         ON bookings(user_id);
CREATE INDEX idx_bookings_journey      ON bookings(journey_id);
CREATE INDEX idx_bookings_status       ON bookings(status);
