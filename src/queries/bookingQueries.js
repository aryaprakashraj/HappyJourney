import { supabase } from '@/lib/supabase';

export async function getUserBookings(userId) {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, journey:journeys(id, origin, destination, departure_time, arrival_time, fare, status, vehicle:vehicles(make, model, license_plate), driver:drivers(full_name))')
    .eq('user_id', userId)
    .order('booked_at', { ascending: false });
  if (error) throw new Error('Failed to fetch user bookings');
  return data;
}

export async function getAllBookings() {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, journey:journeys(id, origin, destination, departure_time, status), user:profiles(id, full_name, email)')
    .order('booked_at', { ascending: false });
  if (error) throw new Error('Failed to fetch all bookings');
  return data;
}

export async function createBooking({ origin, destination, departureTime, vehicleId, userId }) {
  // 1. Check vehicle availability
  const { data: vehicle, error: vError } = await supabase
    .from('vehicles')
    .select('status')
    .eq('id', vehicleId)
    .single();
  if (vError || !vehicle) throw new Error('Failed to verify vehicle availability');
  if (vehicle.status !== 'available') throw new Error('This vehicle is no longer available.');

  // 2. Find an available driver
  const { data: drivers, error: dError } = await supabase
    .from('drivers')
    .select('id')
    .eq('status', 'available')
    .limit(1);
  if (dError || !drivers || drivers.length === 0) throw new Error('No drivers are currently available for this journey.');
  const driverId = drivers[0].id;

  // 3. Rough fare and arrival calculation
  const fare = 5000 + Math.floor(Math.random() * 5000); // KES 5000-10000 roughly
  const arrivalTime = new Date(new Date(departureTime).getTime() + 4 * 60 * 60 * 1000).toISOString();

  // 4. Create Journey (available_seats = 0 since full vehicle is booked)
  const { data: journey, error: jError } = await supabase
    .from('journeys')
    .insert([{
      vehicle_id: vehicleId,
      driver_id: driverId,
      origin,
      destination,
      departure_time: departureTime,
      arrival_time: arrivalTime,
      status: 'scheduled',
      detail: 'at-origin',
      fare,
      available_seats: 0
    }])
    .select()
    .single();
  if (jError) throw new Error('Failed to schedule journey.');

  // 5. Create Booking
  const { data: booking, error: bError } = await supabase
    .from('bookings')
    .insert([{
      journey_id: journey.id,
      user_id: userId,
      seats: 1, // DB schema constraint seats > 0
      status: 'confirmed'
    }])
    .select()
    .single();
  if (bError) throw new Error('Failed to create booking.');

  // 6. Update vehicle and driver status
  await supabase.from('vehicles').update({ status: 'booked' }).eq('id', vehicleId);
  await supabase.from('drivers').update({ status: 'on-duty' }).eq('id', driverId);

  return booking;
}

export async function cancelBooking(bookingId) {
  // 1. Fetch booking and journey
  const { data: booking, error: fetchError } = await supabase
    .from('bookings')
    .select('*, journey:journeys(*, vehicle:vehicles(*))')
    .eq('id', bookingId)
    .single();

  if (fetchError) throw new Error('Failed to fetch booking details');

  // 2. Check journey status
  if (booking.journey.status === 'ongoing' || booking.journey.status === 'completed') {
    throw new Error('Cannot cancel a booking after the journey has started.');
  }

  // 3. Update booking status
  const { data: updatedBooking, error: cancelError } = await supabase
    .from('bookings')
    .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
    .eq('id', bookingId)
    .select()
    .single();

  if (cancelError) throw new Error('Failed to cancel booking');

  // 4. Update journey status to cancelled
  await supabase
    .from('journeys')
    .update({ status: 'cancelled' })
    .eq('id', booking.journey_id);

  // 5. Release vehicle back to available
  if (booking.journey.vehicle_id) {
    await supabase
      .from('vehicles')
      .update({ status: 'available' })
      .eq('id', booking.journey.vehicle_id);
  }

  // 6. Release driver back to available
  if (booking.journey.driver_id) {
    await supabase
      .from('drivers')
      .update({ status: 'available' })
      .eq('id', booking.journey.driver_id);
  }

  return updatedBooking;
}

export async function updateBookingStatus(bookingId, status) {
  const { data, error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', bookingId)
    .select()
    .single();
  if (error) throw new Error('Failed to update booking status');
  return data;
}
