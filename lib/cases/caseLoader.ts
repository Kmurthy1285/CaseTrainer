import { createClient } from '@/lib/supabase/server'
import { CaseData, CaseListItem } from '@/lib/types/Case'

export async function getCases(): Promise<CaseListItem[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('cases')
    .select('id, title, specialty, difficulty')
    .order('title')

  if (error) {
    throw new Error(`Failed to fetch cases: ${error.message}`)
  }

  return (data || []) as CaseListItem[]
}

export async function getCaseById(id: string): Promise<CaseData> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('cases')
    .select('case_data')
    .eq('id', id)
    .single()

  if (error) {
    throw new Error(`Failed to fetch case: ${error.message}`)
  }

  if (!data) {
    throw new Error('Case not found')
  }

  return {
    id,
    ...data.case_data,
  } as CaseData
}
