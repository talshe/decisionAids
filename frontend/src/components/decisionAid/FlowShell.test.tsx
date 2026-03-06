import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import FlowShell from './FlowShell'

describe('FlowShell', () => {
  it('renders progress and navigation actions', () => {
    const onBack = vi.fn()
    const onForward = vi.fn()

    render(
      <FlowShell
        currentStepIndex={1}
        totalSteps={3}
        canGoBack
        canGoForward
        onBack={onBack}
        onForward={onForward}
      >
        <div>Current step content</div>
      </FlowShell>,
    )

    expect(screen.getByText('Step 2 of 3')).toBeInTheDocument()
    expect(screen.getByText('Current step content')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Previous'))
    fireEvent.click(screen.getByText('Next step'))

    expect(onBack).toHaveBeenCalledTimes(1)
    expect(onForward).toHaveBeenCalledTimes(1)
  })
})
