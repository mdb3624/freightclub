import { useEffect, useState } from 'react'
import { themePreferencesApi } from '../api'
import type { ThemeMode, ThemePreferences } from '../types'

interface UseThemePreferencesResult {
  data: ThemePreferences | undefined
  isLoading: boolean
  error: Error | null
  setThemeMode: (mode: ThemeMode) => Promise<void>
}

let cachedPreferences: ThemePreferences | null = null
let isFetching = false
let fetchPromise: Promise<ThemePreferences> | null = null

export function __clearThemePreferencesCache() {
  cachedPreferences = null
  isFetching = false
  fetchPromise = null
}

export function useThemePreferences(): UseThemePreferencesResult {
  const [data, setData] = useState<ThemePreferences | undefined>(cachedPreferences || undefined)
  const [isLoading, setIsLoading] = useState(!cachedPreferences)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (cachedPreferences) {
      setData(cachedPreferences)
      setIsLoading(false)
      return
    }

    if (isFetching && fetchPromise) {
      fetchPromise
        .then((prefs) => {
          setData(prefs)
          setIsLoading(false)
        })
        .catch((err) => {
          setError(err)
          setIsLoading(false)
        })
      return
    }

    isFetching = true
    setIsLoading(true)
    setError(null)

    fetchPromise = themePreferencesApi
      .get()
      .then((prefs) => {
        cachedPreferences = prefs
        setData(prefs)
        setIsLoading(false)
        return prefs
      })
      .catch((err: Error) => {
        setError(err)
        setIsLoading(false)
        throw err
      })
      .finally(() => {
        isFetching = false
      })
  }, [])

  const setThemeMode = async (mode: ThemeMode) => {
    const current = cachedPreferences ?? data
    const updated = await themePreferencesApi.update({
      themeMode: mode,
      sidebarCollapsed: current?.sidebarCollapsed ?? false,
      dashboardLayout: current?.dashboardLayout ?? null,
    })
    cachedPreferences = updated
    setData(updated)
  }

  return { data, isLoading, error, setThemeMode }
}
