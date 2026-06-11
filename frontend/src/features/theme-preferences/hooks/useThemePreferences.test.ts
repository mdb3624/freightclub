/**
 * Feature: US-UI-MIGRATION (Theme State UI Component Migration)
 * AC-1: Persistence Contract — theme_mode/sidebar_collapsed/dashboard_layout
 *       persist via user_preferences and are readable through useThemePreferences
 * AC-5: Theme Mode Switch — switching themeMode triggers a persisted update
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useThemePreferences, __clearThemePreferencesCache } from './useThemePreferences'

vi.mock('../api', () => ({
  themePreferencesApi: {
    get: vi.fn(),
    update: vi.fn(),
  },
}))

import { themePreferencesApi } from '../api'

describe('useThemePreferences Hook — US-UI-MIGRATION', () => {
  beforeEach(() => {
    __clearThemePreferencesCache()
    vi.clearAllMocks()
  })

  afterEach(() => {
    __clearThemePreferencesCache()
  })

  describe('AC-1: Persistence Contract', () => {
    it('should return hook with expected shape', () => {
      expect(typeof useThemePreferences).toBe('function')
    })

    it('should initialize with loading state and no data', () => {
      vi.mocked(themePreferencesApi.get).mockReturnValue(
        new Promise(() => {})
      )
      const { result } = renderHook(() => useThemePreferences())
      expect(result.current).toHaveProperty('data')
      expect(result.current).toHaveProperty('isLoading')
      expect(result.current).toHaveProperty('error')
      expect(result.current).toHaveProperty('setThemeMode')
      expect(result.current.data).toBeUndefined()
    })

    it('should fetch and expose theme_mode/sidebar_collapsed/dashboard_layout', async () => {
      const mockPrefs = {
        id: 'pref-1',
        userId: 'user-1',
        themeMode: 'DARK' as const,
        sidebarCollapsed: true,
        dashboardLayout: { widgets: ['loadBoard'] },
      }
      vi.mocked(themePreferencesApi.get).mockResolvedValueOnce(mockPrefs)

      const { result } = renderHook(() => useThemePreferences())

      expect(result.current.isLoading).toBe(true)
      await waitFor(() => expect(result.current.isLoading).toBe(false))

      expect(result.current.data).toEqual(mockPrefs)
      expect(result.current.data?.themeMode).toBe('DARK')
      expect(result.current.data?.sidebarCollapsed).toBe(true)
      expect(result.current.data?.dashboardLayout).toEqual({ widgets: ['loadBoard'] })
      expect(result.current.error).toBeNull()
    })
  })

  describe('AC-5: Theme Mode Switch', () => {
    it('should persist a themeMode change via setThemeMode', async () => {
      const mockPrefs = {
        id: 'pref-1',
        userId: 'user-1',
        themeMode: 'SYSTEM' as const,
        sidebarCollapsed: false,
        dashboardLayout: null,
      }
      vi.mocked(themePreferencesApi.get).mockResolvedValueOnce(mockPrefs)
      vi.mocked(themePreferencesApi.update).mockResolvedValueOnce({
        ...mockPrefs,
        themeMode: 'DARK',
      })

      const { result } = renderHook(() => useThemePreferences())
      await waitFor(() => expect(result.current.isLoading).toBe(false))

      await act(async () => {
        await result.current.setThemeMode('DARK')
      })

      expect(themePreferencesApi.update).toHaveBeenCalledWith(
        expect.objectContaining({ themeMode: 'DARK' })
      )
      expect(result.current.data?.themeMode).toBe('DARK')
    })
  })
})
