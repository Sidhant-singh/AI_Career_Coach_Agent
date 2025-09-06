import axios from "axios";

export async function getRuns(runId: string) {
    try {
        // Determine the correct base URL based on environment
        const isProduction = process.env.NODE_ENV === 'production';
        const baseUrl = isProduction 
            ? 'https://ai-career-coach-agent-five.vercel.app/api/inngest'
            : process.env.INNGEST_SERVER_HOST || 'http://127.0.0.1:8288';
        
        // Use the correct API endpoint for checking run status
        const url = isProduction 
            ? `${baseUrl}/runs/${runId}`  // Production uses our custom endpoint
            : `${baseUrl}/v1/events/${runId}/runs`;  // Local dev server
        
        console.log("Environment:", process.env.NODE_ENV);
        console.log("Fetching from URL:", url);
        console.log("Using runId:", runId);
        console.log("Base URL:", baseUrl);
        
        const result = await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${process.env.INNGEST_SIGNING_KEY}`
            },
            timeout: 10000 // 10 second timeout
        });
        
        console.log("Raw API response:", result.status, result.statusText);
        console.log("Response data:", JSON.stringify(result.data, null, 2));
        
        return result.data;
    } catch (error) {
        console.error("Error fetching runs - Full error:", error);
        if (typeof error === "object" && error !== null && "response" in error) {
            // @ts-ignore
            console.error("Error response:", (error as any).response?.data);
            // @ts-ignore
            console.error("Error status:", (error as any).response?.status);
        }
        return null; // Return null instead of throwing to continue debugging
    }
}










