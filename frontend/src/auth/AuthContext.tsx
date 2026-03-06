import {
  FacebookAuthProvider,
  GoogleAuthProvider,
  OAuthProvider,
  type AuthProvider as FirebaseAuthProvider,
  type User,
  getIdToken,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { apiRequest } from '../lib/api'
import { auth } from '../lib/firebaseClient'
import type { AuthSessionResponse, UserProfile, UserRole } from '../types/decisionAid'

type ProviderId = 'google' | 'facebook' | 'apple' | 'microsoft'

type AuthContextValue = {
  user: User | null
  token: string | null
  profile: UserProfile | null
  role: UserRole
  loading: boolean
  error: string | null
  signInWithProvider: (providerId: ProviderId) => Promise<void>
  signOutUser: () => Promise<void>
  refreshToken: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const createProvider = (providerId: ProviderId): FirebaseAuthProvider => {
  switch (providerId) {
    case 'google':
      return new GoogleAuthProvider()
    case 'facebook':
      return new FacebookAuthProvider()
    case 'apple':
      return new OAuthProvider('apple.com')
    case 'microsoft':
      return new OAuthProvider('microsoft.com')
    default:
      throw new Error('Unsupported provider')
  }
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const hydrateProfile = useCallback(async (idToken: string) => {
    const session = await apiRequest<AuthSessionResponse>('/api/auth/session', {
      method: 'POST',
      token: idToken,
    })
    setProfile(session.profile)
    setError(null)
  }, [])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      setLoading(true)
      setUser(nextUser)

      try {
        if (nextUser) {
          const idToken = await getIdToken(nextUser, true)
          setToken(idToken)
          await hydrateProfile(idToken)
        } else {
          setToken(null)
          setProfile(null)
          setError(null)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load session.')
        setProfile(null)
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [hydrateProfile])

  const signInWithProvider = useCallback(async (providerId: ProviderId) => {
    setError(null)
    const provider = createProvider(providerId)
    try {
      const result = await signInWithPopup(auth, provider)
      const idToken = await getIdToken(result.user, true)
      setToken(idToken)
      await hydrateProfile(idToken)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to sign in with provider.'
      setError(message)
      throw err
    }
  }, [hydrateProfile])

  const signOutUser = useCallback(async () => {
    setError(null)
    await signOut(auth)
    setToken(null)
    setProfile(null)
  }, [])

  const refreshToken = useCallback(async () => {
    if (!auth.currentUser) return
    const idToken = await getIdToken(auth.currentUser, true)
    setToken(idToken)
    await hydrateProfile(idToken)
  }, [hydrateProfile])

  const refreshProfile = useCallback(async () => {
    if (!token) {
      setProfile(null)
      return
    }

    await hydrateProfile(token)
  }, [hydrateProfile, token])

  const role: UserRole = profile?.role ?? 'guest'

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      profile,
      role,
      loading,
      error,
      signInWithProvider,
      signOutUser,
      refreshToken,
      refreshProfile,
    }),
    [
      user,
      token,
      profile,
      role,
      loading,
      error,
      signInWithProvider,
      signOutUser,
      refreshToken,
      refreshProfile,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
