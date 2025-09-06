import { inngest } from "@/inngest/client";
import axios from "axios";
import { NextResponse } from "next/server";
import { getRuns } from "@/lib/inngest-utils";

export async function POST(req: any) {
    try {
        const { userInput, domain, interviewId, userEmail, isFeedback } = await req.json();

        if (!domain) {
            return NextResponse.json({ error: "Missing domain/role" }, { status: 400 });
        }

        if (!interviewId) {
            return NextResponse.json({ error: "Missing interview ID" }, { status: 400 });
        }

        if (!userEmail) {
            return NextResponse.json({ error: "Missing user email" }, { status: 400 });
        }

        console.log("🚀 Starting AI Interview Agent with:", { domain, interviewId, isFeedback });

        const resultId = await inngest.send({
            name: 'AiInterviewAgent',
            data: {
                interviewId: interviewId,
                userInput: userInput || "",
                domain: domain,
                userEmail: userEmail,
                isFeedback: isFeedback || false,
            },
        });

        console.log("Inngest send result:", JSON.stringify(resultId, null, 2));
        const runId = resultId?.ids[0];
        console.log("Extracted runId:", runId);
        
        if (!runId) {
            return NextResponse.json({ error: "Failed to get run ID" }, { status: 500 });
        }

        let runStatus;
        let attempts = 0;
        const maxAttempts = 120; // 60 seconds timeout with 500ms intervals

        while (attempts < maxAttempts) {
            try {
                runStatus = await getRuns(runId);
                console.log(`Attempt ${attempts + 1}: Full runStatus:`, runStatus);
                
                // Handle null response from getRuns
                if (runStatus === null) {
                    console.log("getRuns returned null - API call failed");
                    attempts++;
                    await new Promise(resolve => setTimeout(resolve, 500));
                    continue;
                }
                
                // Access the nested data structure correctly
                const runData = runStatus.data?.[0];
                console.log(`Attempt ${attempts + 1}: Run status:`, runData?.status);
                
                if (runData?.status === 'Completed') {
                    console.log("Run completed successfully!");
                    break;
                }
                
                if (runData?.status === 'Failed') {
                    return NextResponse.json({ 
                        error: "Inngest function failed" 
                    }, { status: 500 });
                }
                
                await new Promise(resolve => setTimeout(resolve, 500));
                attempts++;
            } catch (pollError) {
                console.error("Error while polling:", pollError);
                attempts++;
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }

        if (attempts >= maxAttempts) {
            return NextResponse.json({ 
                error: "Request timeout - function took too long to complete" 
            }, { status: 504 });
        }

        // Extract the actual content from the response
        const runData = runStatus.data?.[0];
        console.log("Full run data:", JSON.stringify(runData, null, 2));
        
        let interviewData = null;
        
        // Extract interview data from the response
        if (runData?.output?.interviewData) {
            interviewData = runData.output.interviewData;
        } else if (runData?.output) {
            // Fallback: try to parse the output directly
            try {
                interviewData = runData.output;
            } catch (parseError) {
                console.error("Error parsing interview output:", parseError);
                interviewData = {
                    interview_phase: "error",
                    current_question: "Sorry, there was an error processing your request.",
                    question_number: 1,
                    total_questions: 8,
                    domain: domain,
                    feedback: null
                };
            }
        }
        
        if (!interviewData) {
            return NextResponse.json({ 
                error: "No interview data received" 
            }, { status: 500 });
        }

        console.log("Formatted interview response:", interviewData);
        return NextResponse.json(interviewData);
        
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ 
            error: "Internal server error" 
        }, { status: 500 });
    }
}
