import { useTranslation } from 'react-i18next'

export function PageCenterLoading() {
  const { t } = useTranslation()
  return <div className="page-center">{t('common.loading')}</div>
}
