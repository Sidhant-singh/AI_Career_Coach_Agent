import { serve } from "inngest/next";
import { inngest } from "../../../inngest/client";
import { AiCareerAgent, AiResumeAgent, AIRoadmapAgent, AiInterviewAgentFunction } from "@/inngest/function";
import { NextRequest, NextResponse } from "next/server";

// Create an API that serves the functions
const handler = serve({
  client: inngest,
  functions: [
    AiCareerAgent,
    AiResumeAgent,
    AIRoadmapAgent,
    AiInterviewAgentFunction
  ],
});

// Handle the main Inngest endpoints
export const { GET, POST, PUT } = handler;

// Add a custom endpoint to check run status
export async function OPTIONS(request: NextRequest) {
  return handler.OPTIONS(request);
}
