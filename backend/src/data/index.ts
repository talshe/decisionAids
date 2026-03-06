import { adminDb, firebaseAdminAvailable } from '../lib/firebaseAdmin'
import type { AppStore } from './appStore'
import { FirestoreAppStore } from './firestoreStore'
import { MemoryAppStore } from './memoryStore'

export const createAppStore = (): AppStore => {
  if (firebaseAdminAvailable && adminDb) {
    return new FirestoreAppStore(adminDb)
  }

  return new MemoryAppStore()
}
