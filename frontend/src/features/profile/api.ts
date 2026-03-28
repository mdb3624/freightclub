import { apiGet, apiPut } from '@/lib/apiClient'
import type { Profile, UpdateProfileValues } from './types'

export const profileApi = {
  get: () => apiGet<Profile>('/profile'),

  update: (data: UpdateProfileValues) => apiPut<Profile>('/profile', data),
}
