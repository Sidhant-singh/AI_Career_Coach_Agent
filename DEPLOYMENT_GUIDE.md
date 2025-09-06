# 🚀 AI Career Coach - Free Deployment Guide

This guide will help you deploy your AI Career Coach application for free using Vercel and other free services.

## 📋 Prerequisites

1. **GitHub Account** (for code hosting)
2. **Vercel Account** (for hosting)
3. **Neon Account** (for database)
4. **Clerk Account** (for authentication)
5. **Google AI Studio Account** (for Gemini API)
6. **Hugging Face Account** (for Falcon AI)
7. **Inngest Account** (for background jobs)
8. **ImageKit Account** (for file uploads)

## 🎯 Step 1: Prepare Your Code

### 1.1 Push to GitHub
```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/yourusername/ai-career-coach.git
git branch -M main
git push -u origin main
```

### 1.2 Create Environment Variables File
Create `.env.example` in your project root:
```env
# Database
NEXT_PUBLIC_NEON_DB_CONNECTION_STRING=

# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# AI Services
GEMINI_API_KEY=
HUGGINGFACE_API_KEY=

# Background Jobs
INNGEST_SERVER_HOST=
INNGEST_SIGNING_KEY=

# File Upload
IMAGEKIT_PUBLIC_KEY=
IMAGEKIT_PRIVATE_KEY=
IMAGE_ENDPOINT_URL=

# Optional
NEXT_PUBLIC_DID_API_KEY=
FALCON_FINETUNED_MODEL=
```

## 🗄️ Step 2: Set Up Database (Neon - Free)

1. Go to [Neon Console](https://console.neon.tech/)
2. Sign up with GitHub
3. Create a new project
4. Copy the connection string
5. Run the database migration:
```bash
npx drizzle-kit push
```

## 🔐 Step 3: Set Up Authentication (Clerk - Free)

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Create a new application
3. Go to "API Keys" and copy:
   - Publishable Key
   - Secret Key
4. Configure allowed origins in Clerk dashboard

## 🤖 Step 4: Set Up AI Services

### 4.1 Google Gemini API (Free)
1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Create a new API key
3. Copy the API key

### 4.2 Hugging Face API (Free)
1. Go to [Hugging Face](https://huggingface.co/)
2. Sign up and go to Settings → Access Tokens
3. Create a new token with "Read" permissions

## ⚡ Step 5: Set Up Background Jobs (Inngest - Free)

1. Go to [Inngest Dashboard](https://app.inngest.com/)
2. Create a new app
3. Copy the Server Host and Signing Key
4. Deploy your Inngest functions

## 📁 Step 6: Set Up File Upload (ImageKit - Free)

1. Go to [ImageKit Dashboard](https://imagekit.io/)
2. Create a new account
3. Go to Developer Options → API Keys
4. Copy the Public Key, Private Key, and URL Endpoint

## 🚀 Step 7: Deploy to Vercel

### 7.1 Connect to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/)
2. Sign up with GitHub
3. Click "New Project"
4. Import your GitHub repository

### 7.2 Configure Environment Variables
In Vercel dashboard, go to your project → Settings → Environment Variables and add all the variables from Step 1.2

### 7.3 Deploy
1. Click "Deploy"
2. Wait for deployment to complete
3. Your app will be available at `https://your-app-name.vercel.app`

## 🔧 Step 8: Configure Inngest Functions

After Vercel deployment:
1. Go to your Vercel project dashboard
2. Go to Functions tab
3. Find the Inngest function endpoint
4. Update your Inngest app with the correct endpoint

## 🎉 Step 9: Test Your Deployment

1. Visit your deployed URL
2. Test all features:
   - User registration/login
   - AI Career Chat
   - Resume Analysis
   - Roadmap Generation
   - Mock Interview

## 📊 Step 10: Monitor and Optimize

1. Check Vercel Analytics
2. Monitor Inngest function logs
3. Check database usage in Neon
4. Monitor API usage in respective dashboards

## 🆘 Troubleshooting

### Common Issues:

1. **Build Failures**
   - Check environment variables are set
   - Verify all dependencies are in package.json

2. **Database Connection Issues**
   - Verify Neon connection string
   - Check if database is accessible from Vercel

3. **Authentication Issues**
   - Verify Clerk keys are correct
   - Check allowed origins in Clerk dashboard

4. **AI Service Issues**
   - Verify API keys are valid
   - Check API quotas and limits

## 💰 Cost Breakdown (All Free)

- **Vercel**: Free tier (100GB bandwidth, unlimited deployments)
- **Neon**: Free tier (0.5GB storage, 10GB transfer)
- **Clerk**: Free tier (10,000 MAU)
- **Google Gemini**: Free tier (15 requests/minute)
- **Hugging Face**: Free tier (1000 requests/month)
- **Inngest**: Free tier (1000 function runs/month)
- **ImageKit**: Free tier (20GB bandwidth)

## 🎯 Next Steps

1. Set up custom domain (optional)
2. Add analytics (Vercel Analytics)
3. Set up monitoring and alerts
4. Optimize performance
5. Add more features

## 📝 Resume Addition

Once deployed, you can add this to your resume:
- **Project**: AI Career Coach - Full-stack web application
- **Tech Stack**: Next.js, TypeScript, Tailwind CSS, Neon DB, Clerk Auth, AI APIs
- **Features**: AI-powered career guidance, resume analysis, interview prep, learning roadmaps
- **Deployment**: https://your-app-name.vercel.app

Your AI Career Coach is now live and ready to impress potential employers! 🚀


