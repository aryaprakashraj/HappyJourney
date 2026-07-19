export const APP_NAME = 'HappyJourney'

// ─── Route paths ─────────────────────────────────────────────
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  USER: {
    DASHBOARD: '/user/dashboard',
    JOURNEYS: '/user/journeys',
    BOOKINGS: '/user/bookings',
    PROFILE: '/user/profile',
  },
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    VEHICLES: '/admin/vehicles',
    DRIVERS: '/admin/drivers',
    ASSIGNMENTS: '/admin/assignments',
    JOURNEYS: '/admin/journeys',
    BOOKINGS: '/admin/bookings',
    USERS: '/admin/users',
  },
}

// ─── Roles ───────────────────────────────────────────────────
export const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
}

// ─── Status enums (mirror the DB enums exactly) ──────────────
export const VEHICLE_STATUS = {
  AVAILABLE: 'available',
  BOOKED: 'booked',
  ON_JOURNEY: 'on-journey',
  MAINTENANCE: 'maintenance',
}

export const DRIVER_STATUS = {
  AVAILABLE: 'available',
  ON_DUTY: 'on-duty',
  OFF: 'off',
}

export const JOURNEY_STATUS = {
  SCHEDULED: 'scheduled',
  ONGOING: 'ongoing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
}

export const JOURNEY_DETAIL = {
  AT_ORIGIN: 'at-origin',
  EN_ROUTE: 'en-route',
  ARRIVED: 'arrived',
}

export const BOOKING_STATUS = {
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
}
