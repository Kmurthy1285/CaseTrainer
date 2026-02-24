'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CaseData } from '@/lib/types/Case'
import { UserAnswers, DifferentialDiagnosis } from '@/lib/types/Attempt'
import CasePlayer from '@/components/case/CasePlayer'

export default function CasePage({ params }: { params: { id: string } }) {
  const [caseData, setCaseData] = useState<CaseData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCase() {
      try {
        const response = await fetch(`/api/cases/${params.id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch case')
        }
        const data = await response.json()
        setCaseData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchCase()
  }, [params.id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (error || !caseData) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error || 'Case not found'}
      </div>
    )
  }

  return <CasePlayer caseData={caseData} />
}
