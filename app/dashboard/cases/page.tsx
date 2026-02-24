'use client'

// Client component - no dynamic export needed
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CaseListItem } from '@/lib/types/Case'

export default function CasesPage() {
  const [cases, setCases] = useState<CaseListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCases() {
      try {
        const response = await fetch('/api/cases')
        if (!response.ok) {
          throw new Error('Failed to fetch cases')
        }
        const data = await response.json()
        setCases(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchCases()
  }, [])

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800'
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800'
      case 'advanced':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Case Library</h1>
        <p className="mt-2 text-gray-600">
          Select a case to practice your clinical reasoning
        </p>
      </div>

      {cases.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
          No cases available. Please contact an administrator to add cases.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {cases.map((caseItem) => (
            <Link
              key={caseItem.id}
              href={`/dashboard/cases/${caseItem.id}`}
              className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {caseItem.title}
              </h2>
              <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-gray-600">{caseItem.specialty}</span>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(
                    caseItem.difficulty
                  )}`}
                >
                  {caseItem.difficulty}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
