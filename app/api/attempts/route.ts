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
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validated = AttemptRequestSchema.parse(body)

    // Get case data
    const caseData = await getCaseById(validated.case_id)

    // Generate feedback using AI
    const feedback = await generateFeedback(caseData, validated.answers as UserAnswers)

    // Save attempt to database
    const adminSupabase = createAdminClient()
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
        { error: 'Failed to save attempt' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      attempt_id: attempt.id,
      feedback,
    })
  } catch (error) {
    console.error('Error processing attempt:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to process attempt' },
      { status: 500 }
    )
  }
}
