import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { isValidLocale, type SupportedLocale } from '../i18n'

export function useLocale(): SupportedLocale {
  const { locale } = useParams<{ locale: string }>()
  return useMemo(() => {
    if (locale && isValidLocale(locale)) {
      return locale
    }
    return 'en'
  }, [locale])
}

export function useLocalePath(): (path: string) => string {
  const locale = useLocale()
  return useMemo(
    () => (path: string) => {
      const clean = path.startsWith('/') ? path.slice(1) : path
      return `/${locale}/${clean}`.replace(/\/+/g, '/')
    },
    [locale],
  )
}
