import { supabase } from '@/lib/supabase'

/**
 * Fetch a single user's profile by auth user ID.
 */
export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) throw new Error('Could not load user profile.')
  return data
}

/**
 * Update the current user's own profile.
 * Only allows updating safe fields (full_name, phone).
 * Role changes must go through admin queries.
 */
export async function updateProfile(userId, { fullName, phone }) {
  const updates = {}
  if (fullName !== undefined) updates.full_name = fullName
  if (phone !== undefined) updates.phone = phone

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) throw new Error('Could not update profile.')
  return data
}

/**
 * Fetch all users (admin only).
 */
export async function getAllUsers() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw new Error('Could not load users.')
  return data
}
