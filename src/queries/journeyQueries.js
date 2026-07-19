import { supabase } from '@/lib/supabase';

export async function getJourneys() {
  const { data, error } = await supabase
    .from('journeys')
    .select('*, vehicle:vehicles(id, make, model, license_plate), driver:drivers(id, full_name)')
    .order('departure_time', { ascending: false });
  if (error) throw new Error('Failed to fetch journeys');
  return data;
}

export async function getAvailableJourneys() {
  const { data, error } = await supabase
    .from('journeys')
    .select('*, vehicle:vehicles(id, make, model, license_plate), driver:drivers(id, full_name)')
    .eq('status', 'scheduled')
    .gt('available_seats', 0)
    .order('departure_time', { ascending: true });
  if (error) throw new Error('Failed to fetch available journeys');
  return data;
}

export async function searchJourneys({ origin, destination, departureDate }) {
  let query = supabase
    .from('journeys')
    .select('*, vehicle:vehicles(id, make, model, license_plate), driver:drivers(id, full_name)')
    .eq('status', 'scheduled')
    .gt('available_seats', 0)
    .order('departure_time', { ascending: true });

  if (origin) {
    query = query.ilike('origin', `%${origin}%`);
  }
  if (destination) {
    query = query.ilike('destination', `%${destination}%`);
  }
  if (departureDate) {
    const startOfDay = new Date(departureDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);
    
    query = query
      .gte('departure_time', startOfDay.toISOString())
      .lt('departure_time', endOfDay.toISOString());
  }

  const { data, error } = await query;
  if (error) throw new Error('Failed to search journeys');
  return data;
}

export async function getJourney(id) {
  const { data, error } = await supabase
    .from('journeys')
    .select('*, vehicle:vehicles(id, make, model, license_plate), driver:drivers(id, full_name)')
    .eq('id', id)
    .single();
  if (error) throw new Error('Failed to fetch journey details');
  return data;
}

export async function createJourney(journey) {
  const { data, error } = await supabase
    .from('journeys')
    .insert([journey])
    .select()
    .single();
  if (error) throw new Error('Failed to create journey');
  return data;
}

export async function updateJourney(id, updates) {
  const { data, error } = await supabase
    .from('journeys')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error('Failed to update journey');
  return data;
}

export async function updateJourneyStatus(id, status, detail) {
  const { data: journey, error: journeyError } = await supabase
    .from('journeys')
    .update({ status, detail })
    .eq('id', id)
    .select()
    .single();
    
  if (journeyError) throw new Error('Failed to update journey status');

  if (status === 'completed' || status === 'cancelled') {
    await supabase.from('vehicles').update({ status: 'available' }).eq('id', journey.vehicle_id);
    await supabase.from('drivers').update({ status: 'available' }).eq('id', journey.driver_id);
  } else if (status === 'ongoing') {
    await supabase.from('vehicles').update({ status: 'on-journey' }).eq('id', journey.vehicle_id);
    await supabase.from('drivers').update({ status: 'on-duty' }).eq('id', journey.driver_id);
  }

  return journey;
}

export async function deleteJourney(id) {
  const { data: bookings, error: bookingsError } = await supabase
    .from('bookings')
    .select('id')
    .eq('journey_id', id)
    .eq('status', 'confirmed')
    .limit(1);
    
  if (bookingsError) throw new Error('Failed to verify journey bookings');
  if (bookings && bookings.length > 0) throw new Error('Cannot delete journey with confirmed bookings');

  const { error } = await supabase.from('journeys').delete().eq('id', id);
  if (error) throw new Error('Failed to delete journey');
  return true;
}
