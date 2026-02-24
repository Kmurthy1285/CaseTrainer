import { z } from 'zod'
import { CaseData } from '@/lib/types/Case'

const InitialPresentationSchema = z.object({
  age: z.number(),
  sex: z.string(),
  chief_complaint: z.string(),
  vitals: z.string(),
  summary: z.string(),
})

const FullCaseSchema = z.object({
  history: z.string(),
  exam: z.string(),
  labs: z.string(),
  imaging: z.string(),
})

const GoldStandardSchema = z.object({
  problem_representation: z.string(),
  final_diagnosis: z.string(),
  management: z.string(),
})

const DifferentialItemSchema = z.object({
  name: z.string(),
  rank: z.number(),
  why_fits: z.string(),
  why_not: z.string(),
  life_threatening: z.boolean(),
})

const RequiredActionsSchema = z.object({
  must_not_miss: z.array(z.string()),
  ideal: z.array(z.string()),
})

const CaseDataSchema = z.object({
  id: z.string(),
  title: z.string(),
  specialty: z.string(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  initial_presentation: InitialPresentationSchema,
  full_case: FullCaseSchema,
  gold_standard: GoldStandardSchema,
  differential: z.array(DifferentialItemSchema),
  required_actions: RequiredActionsSchema,
  common_mistakes: z.array(z.string()),
  cognitive_bias_traps: z.array(z.string()),
  teaching_points: z.array(z.string()),
})

export function validateCaseData(data: unknown): CaseData {
  return CaseDataSchema.parse(data)
}
