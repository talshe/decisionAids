import type { DecodedIdToken } from 'firebase-admin/auth'
import { getConfiguredAdminEmails, getConfiguredAdminUids } from '../lib/firebaseAdmin'
import type { UserRole } from '../domain/models'

export const resolveRoleForToken = (token: DecodedIdToken): UserRole => {
  const adminEmails = getConfiguredAdminEmails()
  const adminUids = getConfiguredAdminUids()
  const email = token.email?.toLowerCase()

  if (adminUids.includes(token.uid)) {
    return 'admin'
  }

  if (email && adminEmails.includes(email)) {
    return 'admin'
  }

  if (token.role === 'admin') {
    return 'admin'
  }

  return 'user'
}
