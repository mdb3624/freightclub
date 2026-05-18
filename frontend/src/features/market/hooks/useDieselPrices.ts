import { useEffect, useState } from 'react'
import { marketApi } from '../api'
import type { DieselPrices } from '../types'

interface UseDieselPricesResult {
  data: DieselPrices | undefined
  isLoading: boolean
  error: Error | null
}

// Session-level cache
let cachedPrices: DieselPrices | null = null
let isFetching = false
let fetchPromise: Promise<DieselPrices> | null = null

// Test helper to clear cache
export function __clearCache() {
  cachedPrices = null
  isFetching = false
  fetchPromise = null
}

export function useDieselPrices(): UseDieselPricesResult {
  const [data, setData] = useState<DieselPrices | undefined>(cachedPrices || undefined)
  const [isLoading, setIsLoading] = useState(!cachedPrices)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    // If already cached, use cached data
    if (cachedPrices) {
      setData(cachedPrices)
      setIsLoading(false)
      return
    }

    // If already fetching, wait for existing promise
    if (isFetching && fetchPromise) {
      fetchPromise
        .then((prices) => {
          setData(prices)
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

    fetchPromise = marketApi.getDieselPrices()
      .then((prices) => {
        cachedPrices = prices
        setData(prices)
        setIsLoading(false)
        return prices
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
