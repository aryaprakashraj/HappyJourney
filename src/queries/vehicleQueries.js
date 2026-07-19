import { supabase } from '@/lib/supabase';

export async function getVehicles() {
  const { data, error } = await supabase.from('vehicles').select('*').order('created_at', { ascending: false });
  if (error) throw new Error('Failed to fetch vehicles');
  return data;
}

export async function getVehicle(id) {
  const { data, error } = await supabase.from('vehicles').select('*').eq('id', id).single();
  if (error) throw new Error('Failed to fetch vehicle');
  return data;
}

export async function getAvailableVehicles() {
  const { data, error } = await supabase.from('vehicles').select('*').eq('status', 'available');
  if (error) throw new Error('Failed to fetch available vehicles');
  return data;
}

export async function createVehicle(vehicle) {
  const { data, error } = await supabase.from('vehicles').insert([vehicle]).select().single();
  if (error) throw new Error('Failed to create vehicle');
  return data;
}

export async function updateVehicle(id, updates) {
  const { data, error } = await supabase.from('vehicles').update(updates).eq('id', id).select().single();
  if (error) throw new Error('Failed to update vehicle');
  return data;
}

export async function deleteVehicle(id) {
  const { data: journeys, error: checkError } = await supabase.from('journeys').select('id').eq('vehicle_id', id).limit(1);
  if (checkError) throw new Error('Failed to verify vehicle usage');
  if (journeys && journeys.length > 0) throw new Error('Cannot delete vehicle that has associated journeys');

  const { error } = await supabase.from('vehicles').delete().eq('id', id);
  if (error) throw new Error('Failed to delete vehicle');
  return true;
}

export async function updateVehicleStatus(id, status) {
  const { data, error } = await supabase.from('vehicles').update({ status }).eq('id', id).select().single();
  if (error) throw new Error('Failed to update vehicle status');
  return data;
}
