import { supabase } from '@/lib/supabase';

export async function getAssignments() {
  const { data, error } = await supabase
    .from('vehicle_assignments')
    .select('*, vehicle:vehicles(id, make, model, license_plate), driver:drivers(id, full_name, license_number)')
    .order('assigned_at', { ascending: false });
  if (error) throw new Error('Failed to fetch assignments');
  return data;
}

export async function getCurrentAssignments() {
  const { data, error } = await supabase
    .from('vehicle_assignments')
    .select('*, vehicle:vehicles(id, make, model, license_plate), driver:drivers(id, full_name, license_number)')
    .eq('is_current', true);
  if (error) throw new Error('Failed to fetch current assignments');
  return data;
}

export async function getVehicleAssignmentHistory(vehicleId) {
  const { data, error } = await supabase
    .from('vehicle_assignments')
    .select('*, driver:drivers(id, full_name, license_number)')
    .eq('vehicle_id', vehicleId)
    .order('assigned_at', { ascending: false });
  if (error) throw new Error('Failed to fetch vehicle assignment history');
  return data;
}

export async function assignDriver(vehicleId, driverId, notes = '') {
  // 1. Update any existing current assignment for vehicleId
  const { error: updateError } = await supabase
    .from('vehicle_assignments')
    .update({ is_current: false, unassigned_at: new Date().toISOString() })
    .eq('vehicle_id', vehicleId)
    .eq('is_current', true);
    
  if (updateError) throw new Error('Failed to close existing assignment');

  // 2. Insert new assignment
  const { data, error: insertError } = await supabase
    .from('vehicle_assignments')
    .insert([{ vehicle_id: vehicleId, driver_id: driverId, is_current: true, notes }])
    .select('*, vehicle:vehicles(id, make, model, license_plate), driver:drivers(id, full_name, license_number)')
    .single();

  if (insertError) throw new Error('Failed to create new assignment');
  return data;
}

export async function closeAssignment(assignmentId) {
  const { data, error } = await supabase
    .from('vehicle_assignments')
    .update({ is_current: false, unassigned_at: new Date().toISOString() })
    .eq('id', assignmentId)
    .select()
    .single();

  if (error) throw new Error('Failed to close assignment');

  if (data && data.driver_id) {
    const { error: driverError } = await supabase
      .from('drivers')
      .update({ status: 'available' })
      .eq('id', data.driver_id);
    
    if (driverError) {
      throw new Error('Failed to update driver status to available');
    }
  }

  return data;
}
