'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Feedback } from '@/lib/types/Feedback'
import { Attempt } from '@/lib/types/Attempt'
import FeedbackDisplay from '@/components/feedback/FeedbackDisplay'

export default function FeedbackPage({ params }: { params: { attemptId: string } }) {
  const [attempt, setAttempt] = useState<Attempt | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function fetchAttempt() {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push('/login')
          return
        }

        const { data, error: fetchError } = await supabase
          .from('attempts')
          .select('*')
          .eq('id', params.attemptId)
          .eq('user_id', user.id)
          .single()

        if (fetchError) {
          throw new Error('Failed to fetch attempt')
        }

        if (!data) {
          throw new Error('Attempt not found')
        }

        setAttempt(data as Attempt)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchAttempt()
  }, [params.attemptId, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (error || !attempt || !attempt.feedback_json) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error || 'Feedback not available'}
      </div>
    )
  }

  return <FeedbackDisplay feedback={attempt.feedback_json as Feedback} />
}
