'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function Home() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAndRedirect() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          router.replace('/dashboard')
        } else {
          router.replace('/login')
        }
      } catch (error) {
        console.error('Auth check error:', error)
        router.replace('/login')
      } finally {
        setLoading(false)
      }
    }
    checkAndRedirect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return null
}
