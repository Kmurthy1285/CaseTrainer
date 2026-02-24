export interface FeedbackScores {
  problem_representation: number
  differential_quality: number
  prioritization: number
  data_interpretation: number
  clinical_safety: number
}

export interface Feedback {
  scores: FeedbackScores
  strengths: string[]
  misses: string[]
  biases: string[]
  teaching_points: string[]
  overall_summary: string
}
