import type { UseFormRegister } from 'react-hook-form'
import { usePersonaTheme } from '@/contexts/PersonaThemeContext'
import type { UpdateProfileValues } from '@/features/profile/types'

interface Props {
  register: UseFormRegister<UpdateProfileValues>
}

export function NotificationsSection({ register }: Props) {
  const { surfaceClassName, mutedClassName, textClassName } = usePersonaTheme()

  return (
    <section className={`p-6 space-y-4 ${surfaceClassName}`}>
      <h3 className={`text-sm font-semibold uppercase tracking-wide ${mutedClassName}`}>Notification Preferences</h3>
      <div className="space-y-3">
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" {...register('notifyEmail')} />
          <span className={`text-sm ${textClassName}`}>Email notifications</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" {...register('notifySms')} />
          <span className={`text-sm ${textClassName}`}>SMS notifications</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" {...register('notifyInApp')} />
          <span className={`text-sm ${textClassName}`}>In-app notifications</span>
        </label>
      </div>
    </section>
  )
}
