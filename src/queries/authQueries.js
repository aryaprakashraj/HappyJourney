import { supabase } from '@/lib/supabase'

/**
 * Sign in with email and password.
 * Returns the Supabase session on success.
 */
export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new Error(error.message)
  return data
}

/**
 * Register a new user.
 * The profile row is created automatically by the DB trigger (handle_new_auth_user).
 */
export async function signUp({ email, password, fullName }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  })
  if (error) throw new Error(error.message)
  return data
}

/**
 * Sign out the current user.
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw new Error(error.message)
}

/**
 * Get the current active session (if any).
 */
export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw new Error(error.message)
  return data.session
}
