import apiClient from '@/lib/apiClient'
import type { Profile, UpdateProfileValues } from './types'

export const profileApi = {
  get: () =>
    apiClient.get<Profile>('/profile').then((r) => r.data),

  update: (data: UpdateProfileValues) =>
    apiClient.put<Profile>('/profile', data).then((r) => r.data),
}
