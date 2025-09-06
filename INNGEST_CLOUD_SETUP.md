# Inngest Cloud Setup Guide

## Environment Variables Required for Production

Add these environment variables to your Vercel dashboard:

### 1. Inngest Configuration
```env
INNGEST_EVENT_KEY=your-inngest-event-key-here
INNGEST_SIGNING_KEY=your-inngest-signing-key-here
```

### 2. AI Model Configuration
```env
GEMINI_API_KEY=your-gemini-api-key-here
```

### 3. Database Configuration (if using)
```env
DATABASE_URL=your-database-url-here
```

### 4. ImageKit Configuration (for resume uploads)
```env
IMAGEKIT_PUBLIC_KEY=your-imagekit-public-key
IMAGEKIT_PRIVATE_KEY=your-imagekit-private-key
IMAGE_ENDPOINT_URL=your-imagekit-endpoint-url
```

### 5. Clerk Authentication (if using)
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
CLERK_SECRET_KEY=your-clerk-secret-key
```

### 6. Environment
```env
NODE_ENV=production
```

## How to Get Inngest Keys

1. Go to [Inngest Dashboard](https://app.inngest.com)
2. Create a new app or select your existing app
3. Go to Settings → API Keys
4. Copy the Event Key and Signing Key

## Deployment Steps

1. Set all environment variables in Vercel dashboard
2. Deploy your application
3. Test the Inngest sync at: `https://ai-career-coach-agent-five.vercel.app/api/inngest`

## Troubleshooting

- If you get "Expected server kind cloud, got dev" error, make sure you have set `INNGEST_EVENT_KEY` and `INNGEST_SIGNING_KEY`
- The sync should work once the environment variables are properly configured
- Your agents will work in production once the sync is successful
