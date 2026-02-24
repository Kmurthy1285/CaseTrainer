/**
 * Script to import cases from JSON files in the cases/ directory
 * 
 * Usage:
 * 1. Place your case JSON files in the cases/ directory
 * 2. Run: npx tsx scripts/import-cases.ts
 * 
 * The script will automatically find all .json files in the cases/ directory
 * and import them into Supabase.
 */

import * as dotenv from 'dotenv'
import * as path from 'path'
import { createAdminClient } from '../lib/supabase/admin'
import { validateCaseData } from '../lib/cases/caseValidator'
import { CaseData } from '../lib/types/Case'
import * as fs from 'fs'
import { randomUUID } from 'crypto'

// Load environment variables from .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') })

async function importCases() {
  const supabase = createAdminClient()
  const casesDir = path.join(process.cwd(), 'cases')
  
  // Get all JSON files in the cases directory
  const files = fs.readdirSync(casesDir).filter(file => file.endsWith('.json') && file !== 'example-case.json')
  
  if (files.length === 0) {
    console.log('No case JSON files found in the cases/ directory.')
    console.log('Create JSON files following the format in cases/example-case.json')
    return
  }

  console.log(`Found ${files.length} case file(s) to import...\n`)

  let successCount = 0
  let errorCount = 0

  for (const file of files) {
    try {
      const filePath = path.join(casesDir, file)
      const fileContent = fs.readFileSync(filePath, 'utf-8')
      const caseData = JSON.parse(fileContent) as CaseData

      console.log(`Processing ${file}...`)

      // Validate case data
      const validated = validateCaseData(caseData)

      // Generate a UUID for the case (database requires UUID)
      const caseId = randomUUID()

      // Extract metadata for the cases table
      const { id, title, specialty, difficulty, ...caseDataJson } = validated

      // Check if case with same title already exists (to avoid duplicates)
      const { data: existing } = await supabase
        .from('cases')
        .select('id, title')
        .eq('title', validated.title)
        .maybeSingle()

      if (existing) {
        console.log(`  ⚠ Case "${title}" already exists. Skipping...`)
        continue
      }

      // Insert into database
      const { data, error } = await supabase
        .from('cases')
        .insert({
          id: caseId,
          title: validated.title,
          specialty: validated.specialty,
          difficulty: validated.difficulty,
          case_data: caseDataJson,
        })
        .select()

      if (error) {
        console.error(`  ✗ Error importing case "${title}":`, error.message)
        errorCount++
      } else {
        console.log(`  ✓ Successfully imported: ${title}`)
        successCount++
      }
    } catch (error) {
      console.error(`  ✗ Error processing ${file}:`, error instanceof Error ? error.message : error)
      errorCount++
    }
  }

  console.log(`\nImport complete!`)
  console.log(`  ✓ Successfully imported: ${successCount}`)
  console.log(`  ✗ Errors: ${errorCount}`)
}

importCases().catch(console.error)
