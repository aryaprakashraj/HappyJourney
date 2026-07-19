import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { getProfile } from '@/queries/profileQueries'
import { signOut as signOutQuery } from '@/queries/authQueries'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)

  /**
   * Fetches the profile for the given auth user and updates state.
   * Kept as a useCallback so it can be called imperatively (e.g. after profile update).
   */
  const loadProfile = useCallback(async (authUser) => {
    if (!authUser) {
      setProfile(null)
      setRole(null)
      return
    }
    try {
      const profileData = await getProfile(authUser.id)
      setProfile(profileData)
      setRole(profileData.role)
    } catch {
      // Profile fetch failed — clear to avoid stale data
      setProfile(null)
      setRole(null)
    }
  }, [])

  useEffect(() => {
    let mounted = true

    // Hydrate session on initial mount
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return
      const authUser = session?.user ?? null
      setUser(authUser)
      await loadProfile(authUser)
      setLoading(false)
    })

    // React to subsequent sign-in / sign-out / token refresh events
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return
      const authUser = session?.user ?? null
      setUser(authUser)
      await loadProfile(authUser)
      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [loadProfile])

  const signOut = useCallback(async () => {
    await signOutQuery()
    setUser(null)
    setProfile(null)
    setRole(null)
  }, [])

  /**
   * Re-fetch the profile from Supabase.
   * Useful after a profile update so context stays in sync.
   */
  const refreshProfile = useCallback(() => loadProfile(user), [loadProfile, user])

  const value = {
    user,
    profile,
    role,
    loading,
    signOut,
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * Internal hook. Consumers should import useAuth from '@/hooks/useAuth'.
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>')
  }
  return context
}
