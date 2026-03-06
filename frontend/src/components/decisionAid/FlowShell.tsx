type FlowShellProps = {
  currentStepIndex: number
  totalSteps: number
  canGoBack: boolean
  canGoForward: boolean
  onBack: () => void
  onForward: () => void
  children: React.ReactNode
  footer?: React.ReactNode
}

const FlowShell = ({
  currentStepIndex,
  totalSteps,
  canGoBack,
  canGoForward,
  onBack,
  onForward,
  children,
  footer,
}: FlowShellProps) => {
  const progress = totalSteps > 1 ? ((currentStepIndex + 1) / totalSteps) * 100 : 100

  return (
    <div className="flow-shell">
      <div className="progress-card">
        <div className="progress-meta">
          <span>
            Step {currentStepIndex + 1} of {totalSteps}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="progress-track" aria-hidden="true">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {children}

      <div className="flow-actions">
        <button
          type="button"
          className="ghost-button"
          onClick={onBack}
          disabled={!canGoBack}
        >
          Previous
        </button>
        <button
          type="button"
          className="primary-button flow-next-button"
          onClick={onForward}
          disabled={!canGoForward}
        >
          {currentStepIndex + 1 === totalSteps ? 'Finish review' : 'Next step'}
        </button>
      </div>

      {footer}
    </div>
  )
}

export default FlowShell
