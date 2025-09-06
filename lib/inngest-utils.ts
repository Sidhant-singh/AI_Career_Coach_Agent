import axios from "axios";

export async function getRuns(runId: string) {
    try {
        const url = `${process.env.INNGEST_SERVER_HOST}/v1/events/${runId}/runs`;
        console.log("Fetching from URL:", url);
        console.log("Using runId:", runId);
        console.log("INNGEST_SERVER_HOST:", process.env.INNGEST_SERVER_HOST);
        
        const result = await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${process.env.INNGEST_SIGNING_KEY}`
            },
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


