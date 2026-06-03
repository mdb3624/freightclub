import { useCallback, useState } from 'react'

interface SearchBarProps {
  onSearch: (query: string) => void
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null)

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value
    setQuery(newQuery)

    if (timer) clearTimeout(timer)

    const newTimer = setTimeout(() => {
      onSearch(newQuery)
    }, 300)

    setTimer(newTimer)
  }, [onSearch, timer])

  return (
    <input
      data-testid="load-search-input"
      type="text"
      value={query}
      onChange={handleChange}
      placeholder="Search by Load ID or destination city"
      className="w-full max-w-sm px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
    />
  )
}
