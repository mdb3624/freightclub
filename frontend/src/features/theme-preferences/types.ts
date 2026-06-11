export type ThemeMode = 'LIGHT' | 'DARK' | 'SYSTEM'

export interface ThemePreferences {
  id: string
  userId: string
  themeMode: ThemeMode
  sidebarCollapsed: boolean
  dashboardLayout: Record<string, unknown> | null
}

export interface UpdateThemePreferencesValues {
  themeMode: ThemeMode
  sidebarCollapsed: boolean
  dashboardLayout: Record<string, unknown> | null
}
