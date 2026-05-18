import { useEffect, useState } from 'react'
import { loadsApi } from '../api'
import type { AvailableStates } from '../types'

interface UseAvailableStatesResult {
  data: AvailableStates | undefined
  isLoading: boolean
  error: Error | null
}

// Session-level cache to prevent duplicate fetches
let cachedStates: AvailableStates | null = null
let isFetching = false
let fetchPromise: Promise<AvailableStates> | null = null

// Test helper to clear cache
export function __clearCache() {
  cachedStates = null
  isFetching = false
  fetchPromise = null
}

export function useAvailableStates(): UseAvailableStatesResult {
  const [data, setData] = useState<AvailableStates | undefined>(cachedStates || undefined)
  const [isLoading, setIsLoading] = useState(!cachedStates)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    // If already cached, use cached data
    if (cachedStates) {
      setData(cachedStates)
      setIsLoading(false)
      return
    }

    // If already fetching, wait for existing promise
    if (isFetching && fetchPromise) {
      fetchPromise
        .then((states) => {
          setData(states)
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

    fetchPromise = loadsApi.getAvailableStates()
      .then((states) => {
        cachedStates = states
        setData(states)
        setIsLoading(false)
        return states
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
