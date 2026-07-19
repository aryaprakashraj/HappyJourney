import { supabase } from '@/lib/supabase';

export async function getDrivers() {
  const { data, error } = await supabase.from('drivers').select('*').order('full_name', { ascending: true });
  if (error) throw new Error('Failed to fetch drivers');
  return data;
}

export async function getDriver(id) {
  const { data, error } = await supabase.from('drivers').select('*').eq('id', id).single();
  if (error) throw new Error('Failed to fetch driver');
  return data;
}

export async function getAvailableDrivers() {
  const { data, error } = await supabase.from('drivers').select('*').eq('status', 'available');
  if (error) throw new Error('Failed to fetch available drivers');
  return data;
}

export async function createDriver(driver) {
  const { data, error } = await supabase.from('drivers').insert([driver]).select().single();
  if (error) throw new Error('Failed to create driver');
  return data;
}

export async function updateDriver(id, updates) {
  const { data, error } = await supabase.from('drivers').update(updates).eq('id', id).select().single();
  if (error) throw new Error('Failed to update driver');
  return data;
}

export async function deleteDriver(id) {
  const { error } = await supabase.from('drivers').delete().eq('id', id);
  if (error) throw new Error('Failed to delete driver');
  return true;
}

export async function updateDriverStatus(id, status) {
  const { data, error } = await supabase.from('drivers').update({ status }).eq('id', id).select().single();
  if (error) throw new Error('Failed to update driver status');
  return data;
}
