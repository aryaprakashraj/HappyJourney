import { supabase } from '@/lib/supabase';

export async function getDashboardStats() {
  try {
    const [vehiclesRes, driversRes, journeysRes, bookingsRes, usersRes] = await Promise.all([
      supabase.from('vehicles').select('status'),
      supabase.from('drivers').select('status'),
      supabase.from('journeys').select('status'),
      supabase.from('bookings').select('status'),
      supabase.from('profiles').select('id, role')
    ]);

    if (vehiclesRes.error || driversRes.error || journeysRes.error || bookingsRes.error || usersRes.error) {
      throw new Error('Failed to fetch some dashboard stats');
    }

    const vehicles = vehiclesRes.data || [];
    const drivers = driversRes.data || [];
    const journeys = journeysRes.data || [];
    const bookings = bookingsRes.data || [];
    const users = usersRes.data || [];

    return {
      vehicles: {
        total: vehicles.length,
        available: vehicles.filter(v => v.status === 'available').length,
        booked: vehicles.filter(v => v.status === 'booked').length,
        onJourney: vehicles.filter(v => v.status === 'on-journey').length,
        maintenance: vehicles.filter(v => v.status === 'maintenance').length,
      },
      drivers: {
        total: drivers.length,
        available: drivers.filter(d => d.status === 'available').length,
        onDuty: drivers.filter(d => d.status === 'on-duty').length,
        off: drivers.filter(d => d.status === 'off').length,
      },
      journeys: {
        total: journeys.length,
        scheduled: journeys.filter(j => j.status === 'scheduled').length,
        ongoing: journeys.filter(j => j.status === 'ongoing').length,
        completed: journeys.filter(j => j.status === 'completed').length,
        cancelled: journeys.filter(j => j.status === 'cancelled').length,
      },
      bookings: {
        total: bookings.length,
        confirmed: bookings.filter(b => b.status === 'confirmed').length,
        cancelled: bookings.filter(b => b.status === 'cancelled').length,
        completed: bookings.filter(b => b.status === 'completed').length,
      },
      users: {
        total: users.filter(u => u.role === 'user').length
      }
    };
  } catch (error) {
    throw new Error('Failed to load dashboard statistics');
  }
}
