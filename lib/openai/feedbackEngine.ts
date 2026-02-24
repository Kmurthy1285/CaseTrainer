import OpenAI from 'openai'
import { CaseData } from '@/lib/types/Case'
import { UserAnswers } from '@/lib/types/Attempt'
import { Feedback } from '@/lib/types/Feedback'
import { z } from 'zod'

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is required')
  }
  return new OpenAI({
    apiKey,
  })
}

// Schema for validating OpenAI response
const FeedbackSchema = z.object({
  scores: z.object({
    problem_representation: z.number().min(1).max(5),
    differential_quality: z.number().min(1).max(5),
    prioritization: z.number().min(1).max(5),
    data_interpretation: z.number().min(1).max(5),
    clinical_safety: z.number().min(1).max(5),
  }),
  strengths: z.array(z.string()),
  misses: z.array(z.string()),
  biases: z.array(z.string()),
  teaching_points: z.array(z.string()),
  overall_summary: z.string(),
})

export async function generateFeedback(
  caseData: CaseData,
  userAnswers: UserAnswers
): Promise<Feedback> {
  const systemPrompt = `You are a senior attending physician grading a medical student's clinical reasoning.

Your task is to evaluate the student's performance across a structured clinical case and provide comprehensive, actionable feedback.

EVALUATION CRITERIA:
1. Problem Representation (1-5): How well did the student identify and frame the clinical problem?
2. Differential Quality (1-5): How appropriate and comprehensive is the differential diagnosis?
3. Prioritization (1-5): Did the student correctly prioritize life-threatening conditions?
4. Data Interpretation (1-5): How well did the student interpret labs, imaging, and exam findings?
5. Clinical Safety (1-5): Did the student identify critical must-not-miss diagnoses and actions?

INSTRUCTIONS:
- Compare the student's reasoning to the gold standard provided
- Be strict but fair - this is formative assessment
- Identify specific strengths in their reasoning
- Point out missed elements or errors
- Detect cognitive biases (e.g., anchoring, premature closure, availability bias)
- Provide actionable teaching points
- Write an overall summary that synthesizes the evaluation

Return ONLY valid JSON matching this exact structure:
{
  "scores": {
    "problem_representation": 1-5,
    "differential_quality": 1-5,
    "prioritization": 1-5,
    "data_interpretation": 1-5,
    "clinical_safety": 1-5
  },
  "strengths": ["string", "string"],
  "misses": ["string", "string"],
  "biases": ["string"],
  "teaching_points": ["string", "string"],
  "overall_summary": "string"
}`

  const userPrompt = `GOLD STANDARD CASE:

Title: ${caseData.title}
Specialty: ${caseData.specialty}
Difficulty: ${caseData.difficulty}

Initial Presentation:
- Age: ${caseData.initial_presentation.age}
- Sex: ${caseData.initial_presentation.sex}
- Chief Complaint: ${caseData.initial_presentation.chief_complaint}
- Vitals: ${caseData.initial_presentation.vitals}
- Summary: ${caseData.initial_presentation.summary}

Full Case:
History: ${caseData.full_case.history}
Physical Exam: ${caseData.full_case.exam}
Labs: ${caseData.full_case.labs}
Imaging: ${caseData.full_case.imaging}

Gold Standard:
Problem Representation: ${caseData.gold_standard.problem_representation}
Final Diagnosis: ${caseData.gold_standard.final_diagnosis}
Management: ${caseData.gold_standard.management}

Expected Differential (ranked):
${caseData.differential
  .map(
    (d) =>
      `- ${d.rank}. ${d.name} (Life-threatening: ${d.life_threatening ? 'Yes' : 'No'})\n  Why it fits: ${d.why_fits}\n  Why not: ${d.why_not}`
  )
  .join('\n')}

Required Actions:
Must Not Miss: ${caseData.required_actions.must_not_miss.join(', ')}
Ideal: ${caseData.required_actions.ideal.join(', ')}

Common Mistakes: ${caseData.common_mistakes.join('; ')}
Cognitive Bias Traps: ${caseData.cognitive_bias_traps.join('; ')}

---

STUDENT RESPONSES:

Step 1 - Problem Representation:
${userAnswers.step1_problem_representation}

Step 2 - Differential Diagnosis:
${userAnswers.step2_differential
  .map(
    (d) =>
      `Rank ${d.rank}: ${d.name}\nJustification: ${d.justification}`
  )
  .join('\n\n')}

Step 3 - Next Step:
${userAnswers.step3_next_step}

${userAnswers.step4_interpretation ? `Step 4 - Interpretation:\n${userAnswers.step4_interpretation}\n\nUpdated Differential:\n${userAnswers.step4_updated_differential?.map((d) => `Rank ${d.rank}: ${d.name}\nJustification: ${d.justification}`).join('\n\n') || 'None provided'}` : ''}

Step 5 - Final Diagnosis:
${userAnswers.step5_final_diagnosis}

Step 5 - Management Plan:
${userAnswers.step5_management}

---

Evaluate this student's performance and provide feedback in the JSON format specified.`

  try {
    const openai = getOpenAIClient()
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3, // Lower temperature for more consistent, focused responses
    })

    const responseContent = completion.choices[0]?.message?.content
    if (!responseContent) {
      throw new Error('No response from OpenAI')
    }

    const parsed = JSON.parse(responseContent)
    const validated = FeedbackSchema.parse(parsed)

    return validated
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.errors)
      throw new Error('Invalid feedback format from AI')
    }
    console.error('OpenAI API error:', error)
    throw new Error('Failed to generate feedback')
  }
}
