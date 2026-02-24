# AI Clinical Reasoning Trainer

An AI-powered clinical reasoning trainer that helps medical students improve diagnostic thinking through structured clinical cases and AI-generated feedback.

## Features

- **5-Step Case Flow**: Problem Representation → Differential Diagnosis → Next Step → Reveal Data → Final Answer
- **AI-Powered Feedback**: Comprehensive feedback on reasoning quality, strengths, misses, cognitive biases, and teaching points
- **Case Library**: Curated clinical cases with structured data
- **Progress Tracking**: Track your attempts and review feedback

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), React, Tailwind CSS
- **Backend**: Next.js API routes
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **AI**: OpenAI API (GPT-4)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
OPENAI_API_KEY=your_openai_api_key
```

### 3. Set Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the migration SQL in `supabase/migrations/001_initial_schema.sql` in your Supabase SQL editor
3. Copy your Supabase URL and keys to `.env.local`

### 4. Seed Cases

**Option 1: Import from JSON files (Recommended)**
1. Create case JSON files in the `cases/` directory following the format in `cases/example-case.json`
2. Run: `npx tsx scripts/import-cases.ts`
3. The script will automatically find and import all JSON files from the `cases/` directory

**Option 2: Manual insertion via Supabase Dashboard**
1. Go to your Supabase project dashboard
2. Navigate to Table Editor → `cases` table
3. Click "Insert row" and fill in:
   - `id`: A unique identifier (e.g., "case-1")
   - `title`: Case title
   - `specialty`: Medical specialty
   - `difficulty`: "beginner", "intermediate", or "advanced"
   - `case_data`: The full case JSON (copy from your JSON file, excluding id, title, specialty, difficulty)

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
case-trainer/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth routes
│   ├── (dashboard)/       # Protected routes
│   │   ├── cases/         # Case selection & player
│   │   └── feedback/      # Feedback display
│   └── api/               # API routes
├── components/            # React components
│   ├── case/              # Case player components
│   ├── feedback/          # Feedback display components
│   └── auth/              # Auth components
├── lib/                   # Utilities
│   ├── supabase/          # Supabase client & helpers
│   ├── openai/            # OpenAI feedback engine
│   ├── cases/             # Case utilities
│   └── types/             # TypeScript types
└── scripts/               # Utility scripts
```

## Case Data Format

See `cases/example-case.json` for the expected case JSON structure. Each case should include:

- Initial presentation (age, sex, chief complaint, vitals, summary)
- Full case data (history, exam, labs, imaging)
- Gold standard (problem representation, final diagnosis, management)
- Differential diagnosis list
- Required actions
- Common mistakes
- Cognitive bias traps
- Teaching points

## API Endpoints

- `GET /api/cases` - List all cases
- `GET /api/cases/[id]` - Get a specific case
- `POST /api/attempts` - Submit an attempt and get feedback

## Deployment

### Deploy to Vercel via GitHub (Recommended)

1. **Create a GitHub Repository**
   - Go to [github.com/new](https://github.com/new)
   - Name it (e.g., `case-trainer`)
   - Don't initialize with README (we already have one)
   - Click "Create repository"

2. **Push your code to GitHub**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/case-trainer.git
   git push -u origin main
   ```
   (Replace `YOUR_USERNAME` with your GitHub username)

3. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/login with GitHub
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js settings
   - Add environment variables in the "Environment Variables" section:
     - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase URL
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase anon key
     - `SUPABASE_SERVICE_ROLE_KEY` = your service role key
     - `OPENAI_API_KEY` = your OpenAI API key
   - Click "Deploy"

4. **Automatic Deployments**
   - Every push to `main` branch will automatically deploy
   - You can preview deployments from pull requests
   - Your app will be live at: `https://your-project.vercel.app`

### Before Deploying

- Make sure your Supabase project is set up and migrations are run
- Import your cases (run `npm run import-cases` locally or via Supabase dashboard)
- Ensure RLS policies are configured correctly
- Test locally that everything works

## License

MIT
