# HappyJourney — Vehicle Journey Booking System

A full-stack fleet management and journey booking system built with React, Vite, Tailwind CSS, and Supabase. 

## Features

- **Role-based Access Control**: Separate dashboards and permissions for `user` and `admin` roles.
- **Fleet Management**: Admins can manage vehicles, drivers, and assign drivers to vehicles.
- **Journey Management**: Admins can schedule and track journeys (scheduled → ongoing → completed/cancelled).
- **Booking System**: Users can search for scheduled journeys, view available seats, and book a seat. Admins can manage these bookings.
- **Real-time Availability**: Available seats are updated immediately upon booking.
- **Supabase Backend**: Fully serverless backend using Supabase Authentication, PostgreSQL, and Row Level Security (RLS) policies.

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```
Navigate to `http://localhost:5173` in your browser.

## Admin Credentials

The system has been pre-seeded with dummy data, including an admin profile, vehicles, drivers, and a scheduled journey. Use the following credentials to access the Admin Dashboard:

- **Email**: `admin@happyjourney.com`
- **Password**: `adminpassword123`

## Usage Guide

### User Flow
1. **Sign Up**: Create an account via the signup page.
2. **Dashboard**: View your active bookings and recent activity.
3. **Browse Journeys**: Search for routes based on origin, destination, and departure date. 
4. **Book**: Select a journey, choose the number of seats, and confirm your booking.

### Admin Flow
1. **Log In**: Use the admin credentials provided above.
2. **Dashboard**: View live fleet statistics (total vehicles, active journeys, bookings).
3. **Vehicles**: Add, edit, or delete vehicles. Set their status to 'available', 'maintenance', etc.
4. **Drivers**: Add and manage driver profiles.
5. **Assignments**: Assign an available driver to an available vehicle.
6. **Journeys**: Create new scheduled journeys using an assigned vehicle/driver pair. Move journey statuses through their lifecycle.
7. **Bookings & Users**: Oversee all bookings made by users and manage user accounts.

## Troubleshooting

- **"Could not create your account" on Signup**: Ensure you have configured the correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the `.env` file. (Note: A typo in the URL was resolved; ensure you are using `https://bwulxmhxtknpedcyhhxt.supabase.co`).
- **Email Confirmation**: If Supabase email confirmation is enabled on your project, you will need to click the link sent to your email to log in. To bypass this for local development, turn off **Confirm email** in your Supabase Auth settings.
