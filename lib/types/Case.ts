export type Difficulty = 'beginner' | 'intermediate' | 'advanced'

export interface InitialPresentation {
  age: number
  sex: string
  chief_complaint: string
  vitals: string
  summary: string
}

export interface FullCase {
  history: string
  exam: string
  labs: string
  imaging: string
}

export interface GoldStandard {
  problem_representation: string
  final_diagnosis: string
  management: string
}

export interface DifferentialItem {
  name: string
  rank: number
  why_fits: string
  why_not: string
  life_threatening: boolean
}

export interface RequiredActions {
  must_not_miss: string[]
  ideal: string[]
}

export interface CaseData {
  id: string
  title: string
  specialty: string
  difficulty: Difficulty
  initial_presentation: InitialPresentation
  full_case: FullCase
  gold_standard: GoldStandard
  differential: DifferentialItem[]
  required_actions: RequiredActions
  common_mistakes: string[]
  cognitive_bias_traps: string[]
  teaching_points: string[]
}

export interface CaseListItem {
  id: string
  title: string
  specialty: string
  difficulty: Difficulty
}
