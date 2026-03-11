import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocale } from '../hooks/useLocale'

export function LocaleSync() {
  const locale = useLocale()
  const { i18n } = useTranslation()

  useEffect(() => {
    if (i18n.language !== locale) {
      i18n.changeLanguage(locale)
    }
  }, [i18n, locale])

  useEffect(() => {
    const root = document.documentElement
    root.lang = locale === 'he' ? 'he' : 'en'
    root.dir = locale === 'he' ? 'rtl' : 'ltr'
  }, [locale])

  return null
}
