import { Feedback } from './Feedback'

export interface DifferentialDiagnosis {
  name: string
  rank: number
  justification: string
}

export interface UserAnswers {
  step1_problem_representation: string
  step2_differential: DifferentialDiagnosis[]
  step3_next_step: string
  step4_interpretation?: string
  step4_updated_differential?: DifferentialDiagnosis[]
  step5_final_diagnosis: string
  step5_management: string
}

export interface Attempt {
  id: string
  user_id: string
  case_id: string
  answers_json: UserAnswers
  feedback_json: Feedback | null
  created_at: string
}
