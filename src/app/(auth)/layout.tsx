import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={`${inter.className} min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100`}>
      <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              SqueegeeRun
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Window cleaning business management
            </p>
          </div>
          <div className="rounded-lg bg-white px-8 py-8 shadow-lg">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}