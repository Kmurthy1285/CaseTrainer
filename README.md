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

### Deploy to Vercel (Recommended - Easiest)

1. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/login with GitHub
   - Click "New Project"
   - Import your GitHub repository
   - Add environment variables:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`
     - `OPENAI_API_KEY`
   - Click "Deploy"

3. **Your app will be live at**: `https://your-project.vercel.app`

### Alternative: Deploy to Netlify

1. Push to GitHub (same as above)
2. Go to [netlify.com](https://netlify.com)
3. Import from GitHub
4. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
5. Add environment variables (same as Vercel)
6. Deploy

### Before Deploying

- Make sure your Supabase project is set up and migrations are run
- Ensure RLS policies are configured correctly
- Test locally that everything works
- Consider setting up a custom domain (optional)

## License

MIT
