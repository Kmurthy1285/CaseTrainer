import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Suspense } from 'react'

export const dynamic = 'force-dynamic'

async function LastAttemptCard() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Get last attempt
  let lastAttempt = null
  try {
    const { data: attempts, error } = await supabase
      .from('attempts')
      .select('id, case_id, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      // If table doesn't exist or RLS issue, just continue without last attempt
      console.error('Error fetching attempts:', error.message)
    } else {
      lastAttempt = attempts
    }
  } catch (err) {
    // Network errors or other issues - continue without last attempt
    console.error('Error fetching last attempt:', err)
  }

  if (lastAttempt) {
    return (
      <Link
        href={`/dashboard/feedback/${lastAttempt.id}`}
        className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          View Last Case
        </h2>
        <p className="text-gray-600">
          Review feedback from your most recent case attempt
        </p>
      </Link>
    )
  }

  return (
    <div className="block p-6 bg-gray-50 rounded-lg border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-500 mb-2">
        Continue Last Case
      </h2>
      <p className="text-gray-400">
        Complete a case to see your feedback here
      </p>
    </div>
  )
}

export default async function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome</h1>
        <p className="mt-2 text-gray-600">
          Practice your clinical reasoning skills with AI-powered feedback
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Link
          href="/dashboard/cases"
          className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Start New Case
          </h2>
          <p className="text-gray-600">
            Browse available cases and start practicing your diagnostic reasoning
          </p>
        </Link>

        <Suspense
          fallback={
            <div className="block p-6 bg-gray-50 rounded-lg border border-gray-200">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          }
        >
          <LastAttemptCard />
        </Suspense>
      </div>
    </div>
  )
}
