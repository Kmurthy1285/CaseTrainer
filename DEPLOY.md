# Quick Deployment Guide

## Your code is ready! Here's how to deploy:

### Option 1: Using GitHub CLI (if installed)

```bash
gh repo create case-trainer --public --source=. --remote=origin --push
```

Then go to [vercel.com](https://vercel.com) and import the repository.

### Option 2: Manual GitHub Setup

1. **Create a new repository on GitHub:**
   - Go to [github.com/new](https://github.com/new)
   - Name it: `case-trainer` (or any name you like)
   - Make it public or private
   - Don't initialize with README (we already have one)

2. **Push your code:**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/case-trainer.git
   git push -u origin main
   ```
   (Replace YOUR_USERNAME with your GitHub username)

3. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/login (free)
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Add these environment variables:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`
     - `OPENAI_API_KEY`
   - Click "Deploy"

Your app will be live in ~2 minutes!

### Option 3: Deploy directly from Vercel CLI

```bash
npm i -g vercel
vercel
```

Follow the prompts and add your environment variables when asked.
