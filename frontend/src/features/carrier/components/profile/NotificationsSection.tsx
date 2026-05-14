import type { UseFormRegister } from 'react-hook-form'
import type { UpdateProfileValues } from '@/features/profile/types'

interface Props {
  register: UseFormRegister<UpdateProfileValues>
}

export function NotificationsSection({ register }: Props) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Notification Preferences</h3>
      <div className="space-y-3">
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" {...register('notifyEmail')} />
          <span className="text-sm text-gray-700">Email notifications</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" {...register('notifySms')} />
          <span className="text-sm text-gray-700">SMS notifications</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" {...register('notifyInApp')} />
          <span className="text-sm text-gray-700">In-app notifications</span>
        </label>
      </div>
    </section>
  )
}
