import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ runId: string }> }
) {
  try {
    const { runId } = await context.params;
    
    if (!runId) {
      return NextResponse.json({ error: "Missing runId" }, { status: 400 });
    }

    // For production, we need to use Inngest's cloud API
    const isProduction = process.env.NODE_ENV === 'production';
    
    if (isProduction) {
      // In production, use Inngest's cloud API
      const url = `https://api.inngest.com/v1/runs/${runId}`;
      
      const result = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${process.env.INNGEST_SIGNING_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      
      return NextResponse.json(result.data);
    } else {
      // For local development, use the local Inngest server
      const url = `${process.env.INNGEST_SERVER_HOST || 'http://127.0.0.1:8288'}/v1/events/${runId}/runs`;
      
      const result = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${process.env.INNGEST_SIGNING_KEY}`
        },
        timeout: 10000
      });
      
      return NextResponse.json(result.data);
    }
    
  } catch (error) {
    console.error("Error fetching run status:", error);
    
    if (axios.isAxiosError(error)) {
      return NextResponse.json({
        error: "Failed to fetch run status",
        details: error.response?.data || error.message,
        status: error.response?.status || 500
      }, { status: error.response?.status || 500 });
    }
    
    return NextResponse.json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
