import { useTranslation } from 'react-i18next'

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
  const { t } = useTranslation()
  const progress = totalSteps > 1 ? ((currentStepIndex + 1) / totalSteps) * 100 : 100

  return (
    <div className="flow-shell">
      <div className="progress-card">
        <div className="progress-meta">
          <span>
            {t('flowShell.stepOf', {
              current: currentStepIndex + 1,
              total: totalSteps,
            })}
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
          {t('flowShell.previous')}
        </button>
        <button
          type="button"
          className="primary-button flow-next-button"
          onClick={onForward}
          disabled={!canGoForward}
        >
          {currentStepIndex + 1 === totalSteps
            ? t('flowShell.finishReview')
            : t('flowShell.nextStep')}
        </button>
      </div>

      {footer}
    </div>
  )
}

export default FlowShell
