import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import DecisionAidPage from './DecisionAidPage'

const { apiRequest, useAuth } = vi.hoisted(() => ({
  apiRequest: vi.fn(),
  useAuth: vi.fn(),
}))

vi.mock('../lib/api', () => ({
  apiRequest,
}))

vi.mock('../auth/AuthContext', () => ({
  useAuth,
}))

describe('DecisionAidPage', () => {
  it('shows the guest read-only experience', async () => {
    useAuth.mockReturnValue({
      role: 'guest',
      token: null,
    })

    apiRequest.mockResolvedValueOnce({
      item: {
        id: 'decision-aid-lower-back-pain',
        slug: 'lower-back-pain-options',
        title: 'Lower Back Pain Treatment Options',
        summary: 'Compare treatment paths.',
        tags: ['physiotherapy'],
        estimatedMinutes: 8,
        publishStatus: 'published',
        createdBy: 'system',
        createdAt: '2026-03-06T00:00:00.000Z',
        updatedAt: '2026-03-06T00:00:00.000Z',
        steps: [
          {
            id: 'priorities',
            title: 'Your priorities',
            mode: 'mixed',
            description: 'Review and discuss what matters most.',
            contentBlocks: [],
            fields: [
              {
                id: 'notes',
                type: 'textarea',
                label: 'Anything else you want your clinician to know?',
              },
            ],
          },
        ],
      },
    })

    render(
      <MemoryRouter initialEntries={['/en/decision-aids/lower-back-pain-options']}>
        <Routes>
          <Route
            path="/:locale/decision-aids/:slug"
            element={<DecisionAidPage />}
          />
        </Routes>
      </MemoryRouter>,
    )

    await waitFor(() =>
      expect(
        screen.getAllByText('Guest view only').length,
      ).toBeGreaterThanOrEqual(1),
    )

    expect(
      screen.queryByRole('button', { name: 'Save progress' }),
    ).not.toBeInTheDocument()
    expect(
      screen.getByText(/sign in to save answers, favorites, and progress/i),
    ).toBeInTheDocument()
  })
})
