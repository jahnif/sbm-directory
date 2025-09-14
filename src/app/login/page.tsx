'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const sitePassword = process.env.NEXT_PUBLIC_SITE_PASSWORD
    
    // Debug logging (remove in production)
    console.log('Entered password:', password)
    console.log('Expected password:', sitePassword)
    console.log('Environment variables:', { 
      url: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20) + '...', 
      hasPassword: !!sitePassword 
    })
    
    if (password === sitePassword) {
      // Set cookie and redirect
      document.cookie = `site-access=${password}; path=/; max-age=${60 * 60 * 24 * 30}` // 30 days
      router.push('/')
    } else {
      setError(`Incorrect password. Please try again.${!sitePassword ? ' (Environment variable not loaded)' : ''}`)
    }
    
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            SBM Family Directory
          </h1>
          <p className="text-gray-600">
            Please enter the access password to continue
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="relative block w-full px-3 py-3 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter password"
            />
          </div>
          
          {error && (
            <div className="text-red-600 text-sm text-center">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Verifying...' : 'Access Directory'}
          </button>
        </form>
      </div>
    </div>
  )
}