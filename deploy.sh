#!/bin/bash

# AI Career Coach - Deployment Script
echo "🚀 AI Career Coach Deployment Script"
echo "====================================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit - AI Career Coach"
    echo "✅ Git repository initialized"
else
    echo "✅ Git repository already exists"
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local template..."
    cat > .env.local << EOF
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
EOF
    echo "✅ .env.local template created"
    echo "⚠️  Please fill in your environment variables in .env.local"
else
    echo "✅ .env.local already exists"
fi

# Check if .env.example exists
if [ ! -f ".env.example" ]; then
    echo "📝 Creating .env.example..."
    cp .env.local .env.example
    echo "✅ .env.example created"
else
    echo "✅ .env.example already exists"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project to check for errors
echo "🔨 Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed! Please fix the errors above."
    exit 1
fi

echo ""
echo "🎉 Project is ready for deployment!"
echo ""
echo "Next steps:"
echo "1. Push your code to GitHub:"
echo "   git remote add origin https://github.com/yourusername/ai-career-coach.git"
echo "   git push -u origin main"
echo ""
echo "2. Set up your services (see setup-services.md)"
echo ""
echo "3. Deploy to Vercel:"
echo "   - Go to https://vercel.com/"
echo "   - Import your GitHub repository"
echo "   - Add environment variables"
echo "   - Deploy!"
echo ""
echo "4. Update service configurations with your Vercel URL"
echo ""
echo "📚 For detailed instructions, see DEPLOYMENT_GUIDE.md"

