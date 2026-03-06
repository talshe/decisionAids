import request from 'supertest'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp } from './app'
import { MemoryAppStore } from './data/memoryStore'

const { tokenMap, verifyIdToken } = vi.hoisted(() => ({
  tokenMap: new Map<string, Record<string, unknown>>(),
  verifyIdToken: vi.fn(),
}))

verifyIdToken.mockImplementation(async (token: string) => {
  const decoded = tokenMap.get(token)
  if (!decoded) {
    throw new Error('Invalid token')
  }
  return decoded
})

vi.mock('./lib/firebaseAdmin', () => ({
  adminAuth: {
    verifyIdToken,
    getUser: vi.fn(),
    setCustomUserClaims: vi.fn(),
  },
  adminDb: null,
  firebaseAdminAvailable: false,
  getConfiguredAdminEmails: () => [],
  getConfiguredAdminUids: () => [],
  syncUserRoleClaim: vi.fn(),
}))

const authHeader = (token: string) => ({ Authorization: `Bearer ${token}` })

describe('decision aid app', () => {
  beforeEach(() => {
    tokenMap.clear()
    verifyIdToken.mockClear()
  })

  it('serves published decision aids publicly', async () => {
    const app = createApp(new MemoryAppStore())

    const response = await request(app).get('/api/explore')

    expect(response.status).toBe(200)
    expect(response.body.items).toHaveLength(1)
    expect(response.body.items[0].slug).toBe('lower-back-pain-options')
  })

  it('rejects protected routes without auth', async () => {
    const app = createApp(new MemoryAppStore())

    const response = await request(app).get('/api/my-decision-aids')

    expect(response.status).toBe(401)
  })

  it('enforces admin access and supports assignment workflow', async () => {
    const store = new MemoryAppStore()
    const app = createApp(store)

    tokenMap.set('user-token', {
      uid: 'user-1',
      email: 'user@example.com',
      name: 'User One',
      firebase: { sign_in_provider: 'google.com' },
      role: 'user',
    })
    tokenMap.set('admin-token', {
      uid: 'admin-1',
      email: 'admin@example.com',
      name: 'Admin User',
      firebase: { sign_in_provider: 'google.com' },
      role: 'admin',
    })

    await request(app)
      .post('/api/auth/session')
      .set(authHeader('user-token'))
      .send()
      .expect(200)

    await request(app)
      .post('/api/auth/session')
      .set(authHeader('admin-token'))
      .send()
      .expect(200)

    await request(app)
      .get('/api/admin/decision-aids')
      .set(authHeader('user-token'))
      .expect(403)

    const adminDecisionAids = await request(app)
      .get('/api/admin/decision-aids')
      .set(authHeader('admin-token'))
      .expect(200)

    const assignmentResponse = await request(app)
      .post('/api/admin/assignments')
      .set(authHeader('admin-token'))
      .send({
        userId: 'user-1',
        decisionAidId: adminDecisionAids.body.items[0].id,
      })
      .expect(201)

    expect(assignmentResponse.body.assignment.userId).toBe('user-1')

    const myDecisionAids = await request(app)
      .get('/api/my-decision-aids')
      .set(authHeader('user-token'))
      .expect(200)

    expect(myDecisionAids.body.assigned).toHaveLength(1)
  })
})
