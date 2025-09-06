import { NextResponse } from "next/server";

export async function GET() {
  // Only show in development for security
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ 
      message: "Environment check endpoint - check your Vercel logs for details",
      hasInngestEventKey: !!process.env.INNGEST_EVENT_KEY,
      hasInngestSigningKey: !!process.env.INNGEST_SIGNING_KEY,
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
      nodeEnv: process.env.NODE_ENV
    });
  }

  return NextResponse.json({
    message: "Environment variables status:",
    hasInngestEventKey: !!process.env.INNGEST_EVENT_KEY,
    hasInngestSigningKey: !!process.env.INNGEST_SIGNING_KEY,
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    nodeEnv: process.env.NODE_ENV,
    inngestEventKeyPrefix: process.env.INNGEST_EVENT_KEY?.substring(0, 10) + "...",
    inngestSigningKeyPrefix: process.env.INNGEST_SIGNING_KEY?.substring(0, 10) + "..."
  });
}
