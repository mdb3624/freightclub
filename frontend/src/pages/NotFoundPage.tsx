import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-4xl font-semibold text-gray-900">404</h1>
      <p className="text-lg text-gray-700">Page not found</p>
      <p className="max-w-md text-sm text-gray-500">
        The page you&apos;re looking for doesn&apos;t exist. If you got here from a link inside
        the app, that&apos;s a bug &mdash; please report it.
      </p>
      <Link to="/" className="text-blue-600 hover:underline">
        Go back home
      </Link>
    </div>
  )
}
