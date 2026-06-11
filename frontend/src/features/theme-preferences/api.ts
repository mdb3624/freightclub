import { apiGet, apiPut } from '@/lib/apiClient'
import type { ThemePreferences, UpdateThemePreferencesValues } from './types'

export const themePreferencesApi = {
  get: () => apiGet<ThemePreferences>('/preferences/theme'),

  update: (data: UpdateThemePreferencesValues) =>
    apiPut<ThemePreferences>('/preferences/theme', data),
}
