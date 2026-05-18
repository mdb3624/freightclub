import { useEffect, useState } from 'react'
import { profileApi } from '../api'

interface UseProfileResult {
  data: any | undefined
  isLoading: boolean
  error: Error | null
}

// Session-level cache
let cachedProfile: any | null = null
let isFetching = false
let fetchPromise: Promise<any> | null = null

// Test helper to clear cache
export function __clearCache() {
  cachedProfile = null
  isFetching = false
  fetchPromise = null
}

export function useProfile(): UseProfileResult {
  const [data, setData] = useState<any | undefined>(cachedProfile || undefined)
  const [isLoading, setIsLoading] = useState(!cachedProfile)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    // If already cached, use cached data
    if (cachedProfile) {
      setData(cachedProfile)
      setIsLoading(false)
      return
    }

    // If already fetching, wait for existing promise
    if (isFetching && fetchPromise) {
      fetchPromise
        .then((profile) => {
          setData(profile)
          setIsLoading(false)
        })
        .catch((err) => {
          setError(err)
          setIsLoading(false)
        })
      return
    }

    // Start new fetch
    isFetching = true
    setIsLoading(true)
    setError(null)

    fetchPromise = profileApi.get()
      .then((profile) => {
        cachedProfile = profile
        setData(profile)
        setIsLoading(false)
        return profile
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

  return { data, isLoading, error }
}
