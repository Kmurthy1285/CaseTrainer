# Quick GitHub + Vercel Setup

## Step 1: Create GitHub Repository

1. Go to: https://github.com/new
2. Repository name: `case-trainer` (or any name you like)
3. Make it **Public** or **Private** (your choice)
4. **DO NOT** check "Add a README file" (we already have one)
5. Click **"Create repository"**

## Step 2: Push Your Code

After creating the repo, GitHub will show you commands. Use these instead (they're already set up):

```bash
git remote add origin https://github.com/YOUR_USERNAME/case-trainer.git
git branch -M main
git push -u origin main
```

**Replace `YOUR_USERNAME` with your actual GitHub username!**

## Step 3: Connect to Vercel

1. Go to: https://vercel.com
2. Sign up/Login (use "Continue with GitHub")
3. Click **"Add New..."** → **"Project"**
4. Find and select your `case-trainer` repository
5. Click **"Import"**
6. Vercel will auto-detect Next.js - just click **"Deploy"**
7. **Before it finishes**, go to **Settings** → **Environment Variables** and add:
   - `NEXT_PUBLIC_SUPABASE_URL` = (your Supabase project URL)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (your Supabase anon key)
   - `SUPABASE_SERVICE_ROLE_KEY` = (your Supabase service role key)
   - `OPENAI_API_KEY` = (your OpenAI API key)
8. After adding variables, go back to **Deployments** and click **"Redeploy"** on the latest deployment

## Step 4: Done! 🎉

Your app will be live at: `https://your-project-name.vercel.app`

**Future updates:** Just push to GitHub and Vercel will automatically deploy!

```bash
git add .
git commit -m "Your changes"
git push
```
