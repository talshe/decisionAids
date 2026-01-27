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
import { auth } from '../lib/firebaseClient'

type ProviderId = 'google' | 'facebook' | 'apple' | 'microsoft'

type AuthContextValue = {
  user: User | null
  token: string | null
  loading: boolean
  error: string | null
  signInWithProvider: (providerId: ProviderId) => Promise<void>
  signOutUser: () => Promise<void>
  refreshToken: () => Promise<void>
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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser)
      if (nextUser) {
        const idToken = await getIdToken(nextUser, true)
        setToken(idToken)
      } else {
        setToken(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signInWithProvider = useCallback(async (providerId: ProviderId) => {
    setError(null)
    const provider = createProvider(providerId)
    try {
      const result = await signInWithPopup(auth, provider)
      const idToken = await getIdToken(result.user, true)
      setToken(idToken)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to sign in with provider.'
      setError(message)
      throw err
    }
  }, [])

  const signOutUser = useCallback(async () => {
    setError(null)
    await signOut(auth)
    setToken(null)
  }, [])

  const refreshToken = useCallback(async () => {
    if (!auth.currentUser) return
    const idToken = await getIdToken(auth.currentUser, true)
    setToken(idToken)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      loading,
      error,
      signInWithProvider,
      signOutUser,
      refreshToken,
    }),
    [user, token, loading, error, signInWithProvider, signOutUser, refreshToken],
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
