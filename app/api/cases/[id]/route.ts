import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCaseById } from '@/lib/cases/caseLoader'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const caseData = await getCaseById(params.id)
    return NextResponse.json(caseData)
  } catch (error) {
    console.error('Error fetching case:', error)
    if (error instanceof Error && error.message === 'Case not found') {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }
    return NextResponse.json(
      { error: 'Failed to fetch case' },
      { status: 500 }
    )
  }
}
