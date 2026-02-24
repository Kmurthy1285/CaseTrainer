/**
 * Script to seed cases into Supabase
 * 
 * Usage:
 * 1. Place your case JSON files in the cases/ directory
 * 2. Update the cases array below with your case data
 * 3. Run: npx tsx scripts/seed-cases.ts
 * 
 * Or use the Supabase dashboard to insert cases directly
 */

import * as dotenv from 'dotenv'
import * as path from 'path'
import { createAdminClient } from '../lib/supabase/admin'

// Load environment variables from .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') })
import { validateCaseData } from '../lib/cases/caseValidator'
import { CaseData } from '../lib/types/Case'

// Import your cases here
// Example:
// import case1 from '../cases/case1.json'
// import case2 from '../cases/case2.json'

async function seedCases() {
  const supabase = createAdminClient()
  
  // Add your cases here
  const cases: CaseData[] = [
    // Example case structure:
    // {
    //   id: 'case-1',
    //   title: 'Case Title',
    //   specialty: 'Cardiology',
    //   difficulty: 'beginner',
    //   initial_presentation: { ... },
    //   full_case: { ... },
    //   gold_standard: { ... },
    //   differential: [ ... ],
    //   required_actions: { ... },
    //   common_mistakes: [ ... ],
    //   cognitive_bias_traps: [ ... ],
    //   teaching_points: [ ... ],
    // },
  ]

  if (cases.length === 0) {
    console.log('No cases to seed. Add your cases to the cases array in this file.')
    return
  }

  console.log(`Seeding ${cases.length} cases...`)

  for (const caseData of cases) {
    try {
      // Validate case data
      const validated = validateCaseData(caseData)

      // Extract metadata for the cases table
      const { id, title, specialty, difficulty, ...caseDataJson } = validated

      // Insert into database
      const { data, error } = await supabase
        .from('cases')
        .insert({
          id: validated.id,
          title: validated.title,
          specialty: validated.specialty,
          difficulty: validated.difficulty,
          case_data: caseDataJson,
        })
        .select()

      if (error) {
        console.error(`Error seeding case "${title}":`, error.message)
      } else {
        console.log(`✓ Seeded case: ${title}`)
      }
    } catch (error) {
      console.error(`Error processing case:`, error)
    }
  }

  console.log('Seeding complete!')
}

seedCases().catch(console.error)
