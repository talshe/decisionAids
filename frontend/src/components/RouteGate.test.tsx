import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { RouteGate } from './RouteGate'

const { useAuth } = vi.hoisted(() => ({
  useAuth: vi.fn(),
}))

vi.mock('../auth/AuthContext', () => ({
  useAuth,
}))

describe('RouteGate', () => {
  it('redirects guests to login for authenticated routes', () => {
    useAuth.mockReturnValue({
      loading: false,
      role: 'guest',
    })

    render(
      <MemoryRouter initialEntries={['/en/my-decision-aids']}>
        <Routes>
          <Route
            path="/:locale/my-decision-aids"
            element={
              <RouteGate minimumRole="user">
                <div>Private page</div>
              </RouteGate>
            }
          />
          <Route path="/:locale/login" element={<div>Login page</div>} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Login page')).toBeInTheDocument()
  })

  it('renders admin content when the user has admin access', () => {
    useAuth.mockReturnValue({
      loading: false,
      role: 'admin',
    })

    render(
      <MemoryRouter initialEntries={['/en/admin']}>
        <Routes>
          <Route
            path="/:locale/admin"
            element={
              <RouteGate minimumRole="admin">
                <div>Admin page</div>
              </RouteGate>
            }
          />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Admin page')).toBeInTheDocument()
  })
})
