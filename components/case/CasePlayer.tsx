'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CaseData } from '@/lib/types/Case'
import { UserAnswers, DifferentialDiagnosis } from '@/lib/types/Attempt'

interface CasePlayerProps {
  caseData: CaseData
}

export default function CasePlayer({ caseData }: CasePlayerProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const [answers, setAnswers] = useState<UserAnswers>({
    step1_problem_representation: '',
    step2_differential: [
      { name: '', rank: 1, justification: '' },
      { name: '', rank: 2, justification: '' },
      { name: '', rank: 3, justification: '' },
    ],
    step3_next_step: '',
    step4_interpretation: '',
    step4_updated_differential: [
      { name: '', rank: 1, justification: '' },
      { name: '', rank: 2, justification: '' },
      { name: '', rank: 3, justification: '' },
    ],
    step5_final_diagnosis: '',
    step5_management: '',
  })

  const updateDifferential = (
    index: number,
    field: keyof DifferentialDiagnosis,
    value: string | number,
    step: 'step2' | 'step4'
  ) => {
    const key = step === 'step2' ? 'step2_differential' : 'step4_updated_differential'
    const differential = [...(answers[key] || [])]
    differential[index] = { ...differential[index], [field]: value }
    setAnswers({ ...answers, [key]: differential })
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/attempts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          case_id: caseData.id,
          answers,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to submit attempt')
      }

      const data = await response.json()
      router.push(`/dashboard/feedback/${data.attempt_id}`)
    } catch (error) {
      console.error('Error submitting attempt:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit attempt. Please try again.'
      alert(errorMessage)
      setLoading(false)
    }
  }

  const steps = [
    {
      number: 1,
      title: 'Problem Representation',
      component: <Step1ProblemRepresentation caseData={caseData} answers={answers} setAnswers={setAnswers} />,
    },
    {
      number: 2,
      title: 'Differential Diagnosis',
      component: (
        <Step2Differential
          answers={answers}
          updateDifferential={(index, field, value) => updateDifferential(index, field, value, 'step2')}
        />
      ),
    },
    {
      number: 3,
      title: 'Next Step',
      component: <Step3NextStep answers={answers} setAnswers={setAnswers} />,
    },
    {
      number: 4,
      title: 'Reveal Data & Interpretation',
      component: (
        <Step4RevealData
          caseData={caseData}
          answers={answers}
          setAnswers={setAnswers}
          updateDifferential={(index, field, value) => updateDifferential(index, field, value, 'step4')}
        />
      ),
    },
    {
      number: 5,
      title: 'Final Answer',
      component: <Step5FinalAnswer answers={answers} setAnswers={setAnswers} />,
    },
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{caseData.title}</h1>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span>{caseData.specialty}</span>
          <span className="px-2 py-1 bg-gray-100 rounded">{caseData.difficulty}</span>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {steps.map((step) => (
            <div key={step.number} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep === step.number
                    ? 'bg-indigo-600 text-white'
                    : currentStep > step.number
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {step.number}
              </div>
              {step.number < steps.length && (
                <div
                  className={`h-1 w-16 ${
                    currentStep > step.number ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="text-center text-sm font-medium text-gray-700">
          {steps[currentStep - 1].title}
        </div>
      </div>

      {/* Step content */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        {steps[currentStep - 1].component}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        {currentStep < steps.length ? (
          <button
            onClick={() => setCurrentStep(Math.min(steps.length, currentStep + 1))}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Case'}
          </button>
        )}
      </div>
    </div>
  )
}

function Step1ProblemRepresentation({
  caseData,
  answers,
  setAnswers,
}: {
  caseData: CaseData
  answers: UserAnswers
  setAnswers: (answers: UserAnswers) => void
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Initial Presentation</h2>
        <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
          <p>
            <span className="font-medium">Age:</span> {caseData.initial_presentation.age}
          </p>
          <p>
            <span className="font-medium">Sex:</span> {caseData.initial_presentation.sex}
          </p>
          <p>
            <span className="font-medium">Chief Complaint:</span>{' '}
            {caseData.initial_presentation.chief_complaint}
          </p>
          <p>
            <span className="font-medium">Vitals:</span> {caseData.initial_presentation.vitals}
          </p>
          <p>
            <span className="font-medium">Summary:</span>{' '}
            {caseData.initial_presentation.summary}
          </p>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Problem Representation
        </label>
        <textarea
          value={answers.step1_problem_representation}
          onChange={(e) =>
            setAnswers({ ...answers, step1_problem_representation: e.target.value })
          }
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Describe how you would frame this clinical problem..."
        />
      </div>
    </div>
  )
}

function Step2Differential({
  answers,
  updateDifferential,
}: {
  answers: UserAnswers
  updateDifferential: (index: number, field: keyof DifferentialDiagnosis, value: string | number) => void
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Differential Diagnosis</h2>
      <p className="text-sm text-gray-600 mb-4">
        List your top 3 diagnoses, ranked in order of likelihood, with brief justifications.
      </p>
      {answers.step2_differential.map((diag, index) => (
        <div key={index} className="border border-gray-200 rounded-lg p-4">
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Diagnosis #{index + 1}
            </label>
            <input
              type="text"
              value={diag.name}
              onChange={(e) => updateDifferential(index, 'name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Diagnosis name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Justification
            </label>
            <textarea
              value={diag.justification}
              onChange={(e) => updateDifferential(index, 'justification', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Why does this diagnosis fit?"
            />
          </div>
        </div>
      ))}
    </div>
  )
}

function Step3NextStep({
  answers,
  setAnswers,
}: {
  answers: UserAnswers
  setAnswers: (answers: UserAnswers) => void
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Next Step</h2>
      <p className="text-sm text-gray-600 mb-4">
        What test, imaging study, or action would you take next?
      </p>
      <textarea
        value={answers.step3_next_step}
        onChange={(e) => setAnswers({ ...answers, step3_next_step: e.target.value })}
        rows={6}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        placeholder="Describe the next step you would take..."
      />
    </div>
  )
}

function Step4RevealData({
  caseData,
  answers,
  setAnswers,
  updateDifferential,
}: {
  caseData: CaseData
  answers: UserAnswers
  setAnswers: (answers: UserAnswers) => void
  updateDifferential: (index: number, field: keyof DifferentialDiagnosis, value: string | number) => void
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Additional Data</h2>
      <div className="bg-gray-50 p-4 rounded-lg space-y-4 text-sm">
        <div>
          <span className="font-medium">History:</span>
          <p className="mt-1">{caseData.full_case.history}</p>
        </div>
        <div>
          <span className="font-medium">Physical Exam:</span>
          <p className="mt-1">{caseData.full_case.exam}</p>
        </div>
        <div>
          <span className="font-medium">Labs:</span>
          <p className="mt-1">{caseData.full_case.labs}</p>
        </div>
        <div>
          <span className="font-medium">Imaging:</span>
          <p className="mt-1">{caseData.full_case.imaging}</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Interpretation
        </label>
        <textarea
          value={answers.step4_interpretation || ''}
          onChange={(e) =>
            setAnswers({ ...answers, step4_interpretation: e.target.value })
          }
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="How do you interpret these findings?"
        />
      </div>

      <div>
        <h3 className="text-lg font-medium mb-3">Updated Differential</h3>
        <p className="text-sm text-gray-600 mb-4">
          Revise your differential diagnosis based on the new information.
        </p>
        {answers.step4_updated_differential?.map((diag, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Diagnosis #{index + 1}
              </label>
              <input
                type="text"
                value={diag.name}
                onChange={(e) => updateDifferential(index, 'name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Diagnosis name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Justification
              </label>
              <textarea
                value={diag.justification}
                onChange={(e) => updateDifferential(index, 'justification', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Why does this diagnosis fit?"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Step5FinalAnswer({
  answers,
  setAnswers,
}: {
  answers: UserAnswers
  setAnswers: (answers: UserAnswers) => void
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Final Answer</h2>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Final Diagnosis
        </label>
        <input
          type="text"
          value={answers.step5_final_diagnosis}
          onChange={(e) =>
            setAnswers({ ...answers, step5_final_diagnosis: e.target.value })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Final diagnosis"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Management Plan
        </label>
        <textarea
          value={answers.step5_management}
          onChange={(e) =>
            setAnswers({ ...answers, step5_management: e.target.value })
          }
          rows={8}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Describe your management plan..."
        />
      </div>
    </div>
  )
}
