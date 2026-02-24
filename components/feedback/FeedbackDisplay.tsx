'use client'

import { Feedback } from '@/lib/types/Feedback'
import Link from 'next/link'

interface FeedbackDisplayProps {
  feedback: Feedback
}

export default function FeedbackDisplay({ feedback }: FeedbackDisplayProps) {
  const scores = feedback.scores
  const averageScore =
    (scores.problem_representation +
      scores.differential_quality +
      scores.prioritization +
      scores.data_interpretation +
      scores.clinical_safety) /
    5

  const getScoreColor = (score: number) => {
    if (score >= 4) return 'bg-green-500'
    if (score >= 3) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 4.5) return 'Excellent'
    if (score >= 4) return 'Very Good'
    if (score >= 3.5) return 'Good'
    if (score >= 3) return 'Fair'
    if (score >= 2) return 'Needs Improvement'
    return 'Poor'
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Feedback</h1>
        <Link
          href="/dashboard/cases"
          className="text-indigo-600 hover:text-indigo-800"
        >
          ← Back to Cases
        </Link>
      </div>

      {/* Overall Score */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold mb-4">Overall Score</h2>
        <div className="flex items-center space-x-4 mb-6">
          <div className="text-5xl font-bold text-gray-900">
            {averageScore.toFixed(1)}
          </div>
          <div>
            <div className="text-lg font-medium text-gray-700">
              {getScoreLabel(averageScore)}
            </div>
            <div className="text-sm text-gray-500">out of 5.0</div>
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="space-y-4">
          {Object.entries(scores).map(([key, value]) => (
            <div key={key}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {key.replace(/_/g, ' ')}
                </span>
                <span className="text-sm font-medium text-gray-900">{value}/5</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getScoreColor(value)}`}
                  style={{ width: `${(value / 5) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Overall Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-3">Overall Summary</h2>
        <p className="text-gray-700 leading-relaxed">{feedback.overall_summary}</p>
      </div>

      {/* Strengths */}
      {feedback.strengths.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-green-900 mb-3">Strengths</h2>
          <ul className="space-y-2">
            {feedback.strengths.map((strength, index) => (
              <li key={index} className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span className="text-green-800">{strength}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Misses */}
      {feedback.misses.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-yellow-900 mb-3">Areas for Improvement</h2>
          <ul className="space-y-2">
            {feedback.misses.map((miss, index) => (
              <li key={index} className="flex items-start">
                <span className="text-yellow-600 mr-2">•</span>
                <span className="text-yellow-800">{miss}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Cognitive Biases */}
      {feedback.biases.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-900 mb-3">
            Cognitive Bias Flags
          </h2>
          <ul className="space-y-2">
            {feedback.biases.map((bias, index) => (
              <li key={index} className="flex items-start">
                <span className="text-red-600 mr-2">⚠</span>
                <span className="text-red-800">{bias}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Teaching Points */}
      {feedback.teaching_points.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-900 mb-3">Teaching Points</h2>
          <ul className="space-y-3">
            {feedback.teaching_points.map((point, index) => (
              <li key={index} className="flex items-start">
                <span className="text-blue-600 mr-2 font-bold">{index + 1}.</span>
                <span className="text-blue-800 leading-relaxed">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <Link
          href="/dashboard/cases"
          className="flex-1 text-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Try Another Case
        </Link>
        <Link
          href="/dashboard"
          className="flex-1 text-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
