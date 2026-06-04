import { useState, useEffect, useRef, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAddPreferredCarrier } from '../hooks/usePreferredCarriers'
import { addPreferredCarrierSchema, type AddPreferredCarrierFormValues } from '../validation/preferredCarrierSchema'
import { Button } from '@/components/ui/Button'
import { ErrorBanner } from '@/components/ui/ErrorBanner'
import api from '@/api/apiClient'

interface CarrierResult {
  id: string
  firstName: string
  lastName: string
  email: string
  equipmentType: string | null
}

interface AddCarrierModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const EQUIPMENT_COLORS: Record<string, string> = {
  DRY_VAN:   'bg-blue-900 text-blue-300',
  FLATBED:   'bg-amber-900 text-amber-300',
  REEFER:    'bg-cyan-900 text-cyan-300',
  STEP_DECK: 'bg-purple-900 text-purple-300',
  LOWBOY:    'bg-red-900 text-red-300',
}

function initials(first: string, last: string) {
  return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase()
}

export function AddCarrierModal({ isOpen, onClose, onSuccess }: AddCarrierModalProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<CarrierResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [selected, setSelected] = useState<CarrierResult | null>(null)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const searchRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { register, handleSubmit, watch, formState: { errors }, reset, setValue } = useForm<AddPreferredCarrierFormValues>({
    resolver: zodResolver(addPreferredCarrierSchema),
    defaultValues: { notes: '' },
  })
  const { mutate: addCarrier, isPending, error: submitError } = useAddPreferredCarrier()
  const notes = watch('notes')

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchRef.current?.focus(), 50)
      setQuery('')
      setResults([])
      setSelected(null)
      setSearchError(null)
      reset()
    }
  }, [isOpen, reset])

  const search = useCallback(async (term: string) => {
    if (term.length < 2) { setResults([]); setIsSearching(false); return }
    setIsSearching(true)
    setSearchError(null)
    try {
      const { data } = await api.get('/api/v1/shippers/carriers/search', { params: { q: term } })
      setResults(data ?? [])
    } catch {
      setSearchError('Search failed. Please try again.')
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }, [])

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setQuery(val)
    setFocusedIndex(-1)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(val), 300)
  }

  const handleSelect = (carrier: CarrierResult) => {
    setSelected(carrier)
    setValue('carrierId', carrier.id)
    setQuery('')
    setResults([])
  }

  const handleClear = () => {
    setSelected(null)
    setValue('carrierId', '')
    setQuery('')
    setResults([])
    setTimeout(() => searchRef.current?.focus(), 50)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { onClose(); return }
    if (!results.length) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setFocusedIndex(i => Math.min(i + 1, results.length - 1)) }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setFocusedIndex(i => Math.max(i - 1, 0)) }
    if (e.key === 'Enter' && focusedIndex >= 0) { e.preventDefault(); handleSelect(results[focusedIndex]) }
  }

  const onSubmit = (data: AddPreferredCarrierFormValues) => {
    addCarrier(data, {
      onSuccess: () => { reset(); setSelected(null); onSuccess() },
    })
  }

  if (!isOpen) return null

  const showResults = !selected && query.length >= 2

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      onKeyDown={handleKeyDown}
    >
      <div
        data-testid="add-carrier-modal"
        className="bg-[#1E293B] border border-[#334155] rounded-xl shadow-2xl w-full max-w-lg flex flex-col"
        style={{ maxHeight: '90vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#334155]">
          <div>
            <h2 className="text-base font-semibold text-white">Add Carrier to Preferred List</h2>
            <p className="text-xs text-gray-400 mt-0.5">Search for a registered carrier by name or email</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 transition-colors p-1 rounded"
            aria-label="Close"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5 overflow-y-auto flex-1">

          {submitError && <ErrorBanner message="Failed to add carrier. They may already be on your list." />}

          {/* Selected carrier chip */}
          {selected && (
            <div
              data-testid="selected-carrier-chip"
              className="flex items-center gap-3 bg-[#0B1220] border border-[#00E5A8]/40 rounded-lg px-4 py-3"
            >
              <div className="w-8 h-8 rounded-full bg-[#00E5A8]/20 flex items-center justify-center text-xs font-bold text-[#00E5A8] shrink-0">
                {initials(selected.firstName, selected.lastName)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{selected.firstName} {selected.lastName}</p>
                <p className="text-xs text-gray-400 truncate">{selected.email}</p>
              </div>
              <svg className="w-4 h-4 text-[#00E5A8] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <button
                data-testid="clear-carrier-selection"
                onClick={handleClear}
                className="text-gray-500 hover:text-gray-300 transition-colors ml-1"
                aria-label="Clear selection"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Search */}
          {!selected && (
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
                Carrier
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  {isSearching ? (
                    <svg data-testid="carrier-search-loading" className="w-4 h-4 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                    </svg>
                  )}
                </div>
                <input
                  ref={searchRef}
                  data-testid="carrier-search-input"
                  type="text"
                  value={query}
                  onChange={handleQueryChange}
                  placeholder="Search by name or email…"
                  autoComplete="off"
                  className="w-full bg-[#0B1220] border border-[#334155] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                />
              </div>

              {showResults && (
                <div
                  data-testid="carrier-results-list"
                  className="mt-2 bg-[#0B1220] border border-[#334155] rounded-lg overflow-hidden"
                >
                  {searchError && (
                    <p className="px-4 py-3 text-sm text-red-400">{searchError}</p>
                  )}
                  {!searchError && results.length === 0 && !isSearching && (
                    <div data-testid="carrier-search-empty" className="px-4 py-6 text-center">
                      <p className="text-sm text-gray-400">No carriers found for <span className="text-white">"{query}"</span></p>
                      <p className="text-xs text-gray-600 mt-1">Check spelling or try their email address</p>
                    </div>
                  )}
                  {results.map((carrier, idx) => (
                    <button
                      key={carrier.id}
                      data-testid={`carrier-result-${carrier.id}`}
                      type="button"
                      onClick={() => handleSelect(carrier)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-[#334155] last:border-0 ${
                        idx === focusedIndex ? 'bg-[#334155]' : 'hover:bg-[#1E293B]'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-primary-600/20 flex items-center justify-center text-xs font-bold text-primary-400 shrink-0">
                        {initials(carrier.firstName, carrier.lastName)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white">{carrier.firstName} {carrier.lastName}</p>
                        <p className="text-xs text-gray-400 truncate">{carrier.email}</p>
                      </div>
                      {carrier.equipmentType && (
                        <span className={`text-xs px-2 py-0.5 rounded font-medium shrink-0 ${EQUIPMENT_COLORS[carrier.equipmentType] ?? 'bg-gray-800 text-gray-400'}`}>
                          {carrier.equipmentType.replace('_', ' ')}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {!showResults && query.length < 2 && (
                <p className="mt-2 text-xs text-gray-600">Type at least 2 characters to search</p>
              )}
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
              Notes <span className="normal-case text-gray-600">(optional)</span>
            </label>
            <textarea
              data-testid="carrier-notes-textarea"
              {...register('notes')}
              placeholder="e.g., Negotiated 10% discount, always on time"
              rows={3}
              maxLength={500}
              className="w-full bg-[#0B1220] border border-[#334155] rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors resize-none"
            />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-600">{notes?.length || 0} / 500</span>
              {errors.notes && <span className="text-xs text-red-400">{errors.notes.message}</span>}
            </div>
          </div>

          <input type="hidden" {...register('carrierId')} />
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-[#334155]">
          <button
            data-testid="add-carrier-cancel-btn"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-400 hover:text-white border border-[#334155] hover:border-[#475569] rounded-lg transition-colors"
          >
            Cancel
          </button>
          <Button
            data-testid="add-carrier-submit-btn"
            onClick={handleSubmit(onSubmit)}
            isLoading={isPending}
            disabled={!selected}
            className="flex-1"
          >
            Add to Preferred List
          </Button>
        </div>
      </div>
    </div>
  )
}
