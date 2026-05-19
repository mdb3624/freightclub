import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { apiPost, apiPut } from '@/lib/apiClient'
import type { ShipperProfileResponse, ShipperProfileRequest } from '@/types'

const profileSchema = z.object({
  companyName: z.string().min(1, 'Company name required').max(120),
  billingEmail: z.string().email('Invalid email format'),
  phoneNumber: z.string().regex(/^[\d\-\(\)]{10,}$/, 'Invalid US phone format'),
  city: z.string().min(1, 'City required'),
  state: z.string().length(2, 'State code must be 2 characters'),
  zipCode: z.string().regex(/^\d{5}$/, 'ZIP must be 5 digits'),
  mcNumber: z
    .string()
    .optional()
    .refine((v) => !v || /^\d{6,8}$/.test(v), 'MC must be 6-8 digits'),
  usdotNumber: z
    .string()
    .optional()
    .refine((v) => !v || /^\d{6,8}$/.test(v), 'USDOT must be 6-8 digits'),
  logoUrl: z.string().optional().or(z.literal('')),
})

export type ProfileFormData = z.infer<typeof profileSchema>

interface ShipperProfileFormProps {
  initialData?: ShipperProfileResponse | null
  onSuccess?: (data: ShipperProfileResponse) => void
  onCancel?: () => void
}

export function ShipperProfileForm({ initialData, onSuccess, onCancel }: ShipperProfileFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: initialData
      ? {
          companyName: initialData.companyName,
          billingEmail: initialData.billingEmail,
          phoneNumber: initialData.phoneNumber,
          city: initialData.city,
          state: initialData.state,
          zipCode: initialData.zipCode,
          mcNumber: initialData.mcNumber || '',
          usdotNumber: initialData.usdotNumber || '',
          logoUrl: initialData.logoUrl || '',
        }
      : undefined,
  })

  const formValues = watch()

  // Calculate completeness
  const calculateCompleteness = (data: Partial<ProfileFormData>): number => {
    let score = 0
    if (data.companyName) score += 20
    if (data.billingEmail) score += 20
    if (data.phoneNumber) score += 15
    if (data.city && data.state && data.zipCode) score += 25
    if (data.mcNumber || data.usdotNumber) score += 15
    if (data.logoUrl) score += 5
    return Math.min(100, score)
  }

  const completeness = calculateCompleteness(formValues)

  const saveProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      const payload: ShipperProfileRequest = {
        companyName: data.companyName,
        billingEmail: data.billingEmail,
        phoneNumber: data.phoneNumber,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        mcNumber: data.mcNumber || undefined,
        usdotNumber: data.usdotNumber || undefined,
        logoUrl: data.logoUrl || undefined,
      }

      if (initialData?.id) {
        // Update existing profile
        return apiPut<ShipperProfileResponse>('/profile/company-info', payload)
      } else {
        // Create new profile
        return apiPost<ShipperProfileResponse>('/profile/company-info', payload)
      }
    },
    onSuccess: (data) => {
      onSuccess?.(data)
    },
  })

  const onSubmit = (data: ProfileFormData) => {
    saveProfileMutation.mutate(data)
  }

  const stateOptions = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
  ]

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Completeness Bar */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900">Profile Completeness</h3>
          <span className="text-sm font-medium text-gray-700">{completeness}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              completeness >= 80 ? 'bg-green-500' : completeness >= 50 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${completeness}%` }}
          />
        </div>
        <p className="text-xs text-gray-600 mt-2">
          {completeness < 80 ? (
            <>Complete your profile to publish loads</>
          ) : (
            <span className="text-green-700 font-medium">Your profile is ready - you can publish loads</span>
          )}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Company Name */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">Company Name</label>
          <input
            {...register('companyName')}
            type="text"
            placeholder="Enter company name"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.companyName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
            }`}
          />
          {errors.companyName && <p className="text-xs text-red-500 mt-1">{errors.companyName.message}</p>}
        </div>

        {/* Billing Email */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">Billing Email</label>
          <input
            {...register('billingEmail')}
            type="email"
            placeholder="billing@company.com"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.billingEmail ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
            }`}
          />
          {errors.billingEmail && <p className="text-xs text-red-500 mt-1">{errors.billingEmail.message}</p>}
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">Phone Number</label>
          <input
            {...register('phoneNumber')}
            type="tel"
            placeholder="(512) 555-0182"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.phoneNumber ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
            }`}
          />
          {errors.phoneNumber && <p className="text-xs text-red-500 mt-1">{errors.phoneNumber.message}</p>}
        </div>

        {/* City */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">City</label>
          <input
            {...register('city')}
            type="text"
            placeholder="Austin"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.city ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
            }`}
          />
          {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city.message}</p>}
        </div>

        {/* State and ZIP Row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">State</label>
            <select
              {...register('state')}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.state ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
              }`}
            >
              <option value="">Select state</option>
              {stateOptions.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
            {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">ZIP Code</label>
            <input
              {...register('zipCode')}
              type="text"
              placeholder="78701"
              maxLength={5}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.zipCode ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
            {errors.zipCode && <p className="text-xs text-red-500 mt-1">{errors.zipCode.message}</p>}
          </div>
        </div>

        {/* MC Number */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">MC Number (Optional)</label>
          <input
            {...register('mcNumber')}
            type="text"
            placeholder="123456"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.mcNumber ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
            }`}
          />
          {errors.mcNumber && <p className="text-xs text-red-500 mt-1">{errors.mcNumber.message}</p>}
        </div>

        {/* USDOT Number */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">USDOT Number (Optional)</label>
          <input
            {...register('usdotNumber')}
            type="text"
            placeholder="123456"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.usdotNumber ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
            }`}
          />
          {errors.usdotNumber && <p className="text-xs text-red-500 mt-1">{errors.usdotNumber.message}</p>}
        </div>

        {/* Logo URL */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">Logo URL (Optional)</label>
          <input
            {...register('logoUrl')}
            type="text"
            placeholder="https://example.com/logo.png"
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 mt-1">Logo upload coming soon</p>
        </div>

        {/* Error Message */}
        {saveProfileMutation.isError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">
              {saveProfileMutation.error instanceof Error
                ? saveProfileMutation.error.message
                : 'Failed to save profile'}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-6">
          <button
            type="submit"
            disabled={isSubmitting || saveProfileMutation.isPending}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
          >
            {saveProfileMutation.isPending ? 'Saving...' : 'Save Profile'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting || saveProfileMutation.isPending}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
