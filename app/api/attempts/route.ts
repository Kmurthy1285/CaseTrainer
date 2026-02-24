import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCaseById } from '@/lib/cases/caseLoader'
import { generateFeedback } from '@/lib/openai/feedbackEngine'
import { UserAnswers } from '@/lib/types/Attempt'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const AttemptRequestSchema = z.object({
  case_id: z.string().uuid(),
  answers: z.object({
    step1_problem_representation: z.string().min(1),
    step2_differential: z.array(
      z.object({
        name: z.string().min(1),
        rank: z.number().int().min(1).max(3),
        justification: z.string().min(1),
      })
    ).length(3),
    step3_next_step: z.string().min(1),
    step4_interpretation: z.string().optional(),
    step4_updated_differential: z.array(
      z.object({
        name: z.string().min(1),
        rank: z.number().int().min(1).max(3),
        justification: z.string().min(1),
      })
    ).optional(),
    step5_final_diagnosis: z.string().min(1),
    step5_management: z.string().min(1),
  }),
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError) {
      console.error('Auth error:', authError)
      return NextResponse.json(
        { error: 'Authentication failed', details: authError.message },
        { status: 401 }
      )
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse and validate request body
    let body
    try {
      body = await request.json()
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    let validated
    try {
      validated = AttemptRequestSchema.parse(body)
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        console.error('Validation error:', validationError.errors)
        return NextResponse.json(
          { error: 'Invalid request data', details: validationError.errors },
          { status: 400 }
        )
      }
      throw validationError
    }

    // Get case data
    let caseData
    try {
      caseData = await getCaseById(validated.case_id)
      if (!caseData) {
        return NextResponse.json(
          { error: 'Case not found' },
          { status: 404 }
        )
      }
    } catch (caseError) {
      console.error('Error fetching case:', caseError)
      return NextResponse.json(
        { error: 'Failed to fetch case', details: caseError instanceof Error ? caseError.message : 'Unknown error' },
        { status: 500 }
      )
    }

    // Generate feedback using AI
    let feedback
    try {
      feedback = await generateFeedback(caseData, validated.answers as UserAnswers)
    } catch (feedbackError) {
      console.error('Error generating feedback:', feedbackError)
      const errorMessage = feedbackError instanceof Error ? feedbackError.message : 'Unknown error'
      
      // Check if it's an OpenAI API key issue
      if (errorMessage.includes('OPENAI_API_KEY') || errorMessage.includes('apiKey')) {
        return NextResponse.json(
          { error: 'OpenAI API key not configured. Please check environment variables.' },
          { status: 500 }
        )
      }
      
      return NextResponse.json(
        { error: 'Failed to generate feedback', details: errorMessage },
        { status: 500 }
      )
    }

    // Save attempt to database
    let adminSupabase
    try {
      adminSupabase = createAdminClient()
    } catch (adminError) {
      console.error('Error creating admin client:', adminError)
      const errorMessage = adminError instanceof Error ? adminError.message : 'Unknown error'
      if (errorMessage.includes('SUPABASE_SERVICE_ROLE_KEY') || errorMessage.includes('service_role')) {
        return NextResponse.json(
          { error: 'Database configuration error. Please check SUPABASE_SERVICE_ROLE_KEY environment variable.' },
          { status: 500 }
        )
      }
      return NextResponse.json(
        { error: 'Database connection failed', details: errorMessage },
        { status: 500 }
      )
    }

    const { data: attempt, error: dbError } = await adminSupabase
      .from('attempts')
      .insert({
        user_id: user.id,
        case_id: validated.case_id,
        answers_json: validated.answers,
        feedback_json: feedback,
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { error: 'Failed to save attempt', details: dbError.message },
        { status: 500 }
      )
    }

    if (!attempt) {
      return NextResponse.json(
        { error: 'Failed to save attempt - no data returned' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      attempt_id: attempt.id,
      feedback,
    })
  } catch (error) {
    console.error('Unexpected error processing attempt:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to process attempt', details: errorMessage },
      { status: 500 }
    )
  }
}
