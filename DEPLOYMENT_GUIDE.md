# Yuvna Realty - Cloud Deployment Guide

## 🚀 Quick Start (15-20 minutes total)

This guide will help you deploy Yuvna Realty to the cloud with:
- **Vercel** - Frontend + API (FREE)
- **Supabase** - Database + Auth (FREE)
- **AI API** - OpenAI, Claude, or Gemini (~$5-10/month)

---

## Step 1: Supabase Setup (5 minutes)

### 1.1 Create Account & Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up with GitHub (easiest)
3. Click "New Project"
4. Choose a name: `yuvna-realty`
5. Set a database password (save this!)
6. Select region closest to your users
7. Click "Create Project" (takes ~2 minutes)

### 1.2 Run Database Schema
1. In Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the entire contents of `supabase-schema.sql` from this project
4. Paste and click "Run"
5. You should see "Success" for all statements

### 1.3 Get Your API Keys
1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://xxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxx`

Save these - you'll need them for Vercel!

---

## Step 2: AI API Key (2 minutes)

Choose ONE of these (Claude recommended):

### Option A: Anthropic (Claude) - Recommended
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up and add payment method
3. Go to **API Keys** → Create key
4. Copy the key: `sk-ant-xxx`

### Option B: OpenAI (GPT-4)
1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up and add payment method
3. Go to **API Keys** → Create key
4. Copy the key: `sk-xxx`

### Option C: Google (Gemini)
1. Go to [makersuite.google.com](https://makersuite.google.com/app/apikey)
2. Sign in with Google
3. Click "Create API Key"
4. Copy the key

---

## Step 3: Deploy to Vercel (5 minutes)

### 3.1 Connect GitHub
1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up" → Continue with GitHub
3. Authorize Vercel

### 3.2 Import Project
1. Click "Add New" → "Project"
2. Find and select `Yuvna-Reality` repository
3. Click "Import"

### 3.3 Configure Environment Variables
In the "Environment Variables" section, add:

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | `https://xxx.supabase.co` (from Step 1.3) |
| `VITE_SUPABASE_ANON_KEY` | `eyJxxx` (from Step 1.3) |
| `ANTHROPIC_API_KEY` | `sk-ant-xxx` (OR use OPENAI_API_KEY or GEMINI_API_KEY) |

### 3.4 Deploy
1. Click "Deploy"
2. Wait 1-2 minutes
3. Your app is live at `https://yuvna-reality.vercel.app` 🎉

---

## Step 4: Configure Authentication (3 minutes)

### 4.1 Set Redirect URL in Supabase
1. Go to Supabase → **Authentication** → **URL Configuration**
2. Add your Vercel URL to:
   - **Site URL**: `https://your-app.vercel.app`
   - **Redirect URLs**: `https://your-app.vercel.app/*`

### 4.2 Enable Email Auth
1. Go to **Authentication** → **Providers**
2. Make sure **Email** is enabled
3. (Optional) Customize the email template

---

## 🎉 Done!

Your app is now live with:
- ✅ Real AI chat powered by Claude/GPT/Gemini
- ✅ Database for storing buyers, conversations, simulations
- ✅ Magic link authentication
- ✅ Automatic HTTPS and global CDN

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | ✅ | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | ✅ | Supabase anonymous key |
| `ANTHROPIC_API_KEY` | One of these | Claude API key |
| `OPENAI_API_KEY` | One of these | OpenAI API key |
| `GEMINI_API_KEY` | One of these | Google Gemini key |

---

## Monthly Costs

| Service | Free Tier | Paid |
|---------|-----------|------|
| Vercel | 100GB bandwidth | $20/mo Pro |
| Supabase | 500MB database, 50K auth users | $25/mo Pro |
| Claude/OpenAI | - | ~$5-10/mo usage |

**Estimated Total: $0-15/month** for low-medium traffic

---

## Troubleshooting

### "AI not configured" error
- Check that your API key is set correctly in Vercel environment variables
- Redeploy after adding/changing environment variables

### "Database error"
- Make sure you ran the `supabase-schema.sql` script
- Check Supabase dashboard for any error logs

### Auth emails not sending
- Check Supabase → Authentication → Email Templates
- Verify redirect URL is configured correctly

### Need help?
- Supabase docs: [supabase.com/docs](https://supabase.com/docs)
- Vercel docs: [vercel.com/docs](https://vercel.com/docs)

---

## Custom Domain (Optional)

1. In Vercel, go to your project → **Settings** → **Domains**
2. Add your domain: `app.yuvnarealty.com`
3. Follow DNS instructions
4. Update Supabase redirect URLs to include new domain

---

*Last Updated: December 2025*

