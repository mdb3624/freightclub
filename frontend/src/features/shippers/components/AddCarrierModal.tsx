import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAddPreferredCarrier } from '../hooks/usePreferredCarriers'
import { addPreferredCarrierSchema, type AddPreferredCarrierFormValues } from '../validation/preferredCarrierSchema'
import { Button } from '@/components/ui/Button'
import { ErrorBanner } from '@/components/ui/ErrorBanner'
import axios from 'axios'

interface Carrier {
  id: string
  name: string
}

interface AddCarrierModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

// AC-707-1: Shipper can add carrier to preferred list
export function AddCarrierModal({ isOpen, onClose, onSuccess }: AddCarrierModalProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [suggestions, setSuggestions] = useState<Carrier[]>([])
  const [selectedCarrier, setSelectedCarrier] = useState<Carrier | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)

  const { register, handleSubmit, watch, formState: { errors }, reset, setValue } = useForm<AddPreferredCarrierFormValues>({
    resolver: zodResolver(addPreferredCarrierSchema),
    defaultValues: { notes: '' },
  })

  const { mutate: addCarrier, isPending, error } = useAddPreferredCarrier()

  const notes = watch('notes')

  const handleSearch = async (term: string) => {
    setSearchTerm(term)
    if (term.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    try {
      // In a real app, this would call an API endpoint to search carriers
      // For now, we'll simulate with a few mock carriers
      const mockCarriers: Carrier[] = [
        { id: 'carrier-1', name: 'FedEx Freight' },
        { id: 'carrier-2', name: 'XPO Logistics' },
        { id: 'carrier-3', name: 'J.B. Hunt' },
      ]
      const filtered = mockCarriers.filter((c) =>
        c.name.toLowerCase().includes(term.toLowerCase())
      )
      setSuggestions(filtered)
      setShowSuggestions(true)
    } catch (err) {
      console.error('Failed to search carriers:', err)
    }
  }

  const handleSelectCarrier = (carrier: Carrier) => {
    setSelectedCarrier(carrier)
    setValue('carrierId', carrier.id)
    setShowSuggestions(false)
    setSearchTerm('')
  }

  const onSubmit = (data: AddPreferredCarrierFormValues) => {
    addCarrier(data, {
      onSuccess: () => {
        reset()
        setSelectedCarrier(null)
        onSuccess()
      },
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Add Carrier to Preferred List
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {error && (
            <ErrorBanner
              message={
                axios.isAxiosError(error)
                  ? error.response?.data?.message || 'Failed to add carrier'
                  : 'Failed to add carrier'
              }
            />
          )}

          {/* Carrier Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search by carrier name or ID
            </label>
            <div className="relative">
              <input
                data-testid="carrier-search-input"
                type="text"
                placeholder="Type to search..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => searchTerm.length >= 2 && setShowSuggestions(true)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />

              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                  {suggestions.map((carrier) => (
                    <button
                      key={carrier.id}
                      type="button"
                      onClick={() => handleSelectCarrier(carrier)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
                    >
                      {carrier.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {selectedCarrier && (
              <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-blue-900">
                Selected: {selectedCarrier.name}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (optional)
            </label>
            <textarea
              {...register('notes')}
              placeholder="e.g., Negotiated 10% discount"
              rows={3}
              maxLength={500}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <div className="mt-1 text-xs text-gray-500">
              {notes?.length || 0} / 500 characters
            </div>
            {errors.notes && (
              <p className="mt-1 text-xs text-red-600">{errors.notes.message}</p>
            )}
          </div>

          {/* Hidden fields for form values */}
          <input type="hidden" {...register('carrierId')} />
        </form>

        {/* Footer */}
        <div className="flex gap-3 border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md border border-gray-300"
          >
            Cancel
          </button>
          <Button
            onClick={handleSubmit(onSubmit)}
            isLoading={isPending}
            disabled={!selectedCarrier}
            className="flex-1"
          >
            Add Carrier
          </Button>
        </div>
      </div>
    </div>
  )
}
