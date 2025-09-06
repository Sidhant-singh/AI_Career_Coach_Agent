import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { NextResponse } from "next/server";

export async function POST(req: any) {
    try {
        const { userInput, domain, interviewId, userEmail, interviewType, isFeedback, conversationMode, conversationHistory, codeLanguage, dsaQuestion } = await req.json();

        if (!domain) {
            return NextResponse.json({ error: "Missing domain/role" }, { status: 400 });
        }

        console.log("🤖 Simple AI Interview Agent started with:", { domain, interviewType, isFeedback, conversationMode });

        let prompt = "";
        const interviewTypeLabel = interviewType === 'technical' ? 'Technical' : interviewType === 'culture-fit' ? 'Culture Fit' : 'DSA (Data Structures & Algorithms)';
        
        if (isFeedback) {
            // Provide comprehensive feedback on all responses
            prompt = `You are conducting a ${interviewTypeLabel} interview for a ${domain} position.

Complete Interview Conversation: ${userInput}

INTERVIEW TYPE: ${interviewType}
- Technical: Focus on technical skills, problem-solving, coding ability, system design
- Culture Fit: Focus on behavioral aspects, teamwork, leadership, company culture fit
- DSA: Focus on data structures, algorithms, code correctness, time/space complexity

Analyze the entire interview conversation and provide comprehensive feedback including:
- Overall performance score (0-100)
- Key strengths demonstrated
- Areas for improvement
- Detailed analysis of communication, technical knowledge, and problem-solving
- Specific recommendations for improvement
- Next steps for interview preparation
${interviewType === 'dsa' ? '- Code analysis: correctness, efficiency, readability, complexity analysis' : ''}

Format as JSON with detailed feedback.`;
        } else if (conversationMode) {
            // Conversational interview mode
            if (userInput) {
                // Continue conversation based on user response
                const historyContext = conversationHistory ? 
                    conversationHistory.map((h: any) => `AI: ${h.ai_message}\nCandidate: ${h.user_response}`).join('\n\n') : '';
                
                if (interviewType === 'dsa') {
                    prompt = `You are conducting a DSA (Data Structures & Algorithms) interview for a ${domain} position.

CONVERSATION HISTORY:
${historyContext}

CURRENT CANDIDATE CODE/RESPONSE: "${userInput}"

As a DSA interviewer, you should:
1. Analyze their code for correctness, efficiency, and readability
2. Ask about time and space complexity
3. Suggest optimizations if needed
4. Ask follow-up questions about their approach
5. Give hints if they're struggling
6. Ask about edge cases
7. Provide feedback on their solution
8. Ask about alternative approaches

Provide a natural, conversational response that continues the DSA interview flow.`;
                } else {
                    prompt = `You are conducting a ${interviewTypeLabel} interview for a ${domain} position in a conversational style.

CONVERSATION HISTORY:
${historyContext}

CURRENT CANDIDATE RESPONSE: "${userInput}"

INTERVIEW TYPE: ${interviewType}
- Technical: Ask coding challenges, system design, algorithms, technical problem-solving
- Culture Fit: Ask behavioral questions about teamwork, leadership, conflict resolution, company values

As a conversational AI interviewer, you should:
1. Respond naturally to their answer (acknowledge, ask follow-ups, give hints if they're struggling)
2. Ask probing questions that build on their response
3. Give encouragement and hints when appropriate
4. Ask about their experience, projects, or specific examples
5. Be engaging and realistic like a real interviewer
6. Don't limit questions - ask freely based on the conversation flow
7. If they seem stuck, offer hints or ask clarifying questions
8. Show interest in their background and experience

Provide a natural, conversational response that continues the interview flow.`;
                }
            } else {
                // Start conversational interview
                if (interviewType === 'dsa') {
                    prompt = `You are starting a DSA (Data Structures & Algorithms) interview for a ${domain} position.

As a DSA interviewer, you should:
1. Start with a warm, professional greeting
2. Ask them to introduce themselves briefly
3. Present a LeetCode-style problem
4. Ask about their approach before coding
5. Be encouraging and supportive
6. Ask follow-up questions about their solution
7. Focus on problem-solving approach, not just the code

Provide a natural opening and present the first DSA problem.`;
                } else {
                    prompt = `You are starting a ${interviewTypeLabel} interview for a ${domain} position in a conversational style.

INTERVIEW TYPE: ${interviewType}
- Technical: Start with introductions, then move to technical questions
- Culture Fit: Start with introductions, then move to behavioral questions

As a conversational AI interviewer, you should:
1. Start with a warm, professional greeting
2. Ask them to introduce themselves
3. Show genuine interest in their background
4. Ask follow-up questions naturally
5. Be encouraging and supportive
6. Ask freely without limiting question count
7. Make it feel like a real conversation with a professional interviewer

Provide a natural, conversational opening that starts the interview.`;
                }
            }
        } else {
            // Original question-answer mode (fallback)
            if (userInput) {
                prompt = `You are conducting a ${interviewTypeLabel} interview for a ${domain} position.

PREVIOUS CANDIDATE RESPONSE: "${userInput}"

INTERVIEW TYPE: ${interviewType}
- Technical: Ask coding challenges, system design, algorithms, technical problem-solving
- Culture Fit: Ask behavioral questions about teamwork, leadership, conflict resolution, company values
- DSA: Ask data structure and algorithm problems with code solutions

Based on their response, provide:
1. A natural, conversational AI interviewer response (like a real interviewer would speak)
2. A follow-up question that builds on their answer
3. Real-time feedback on their response (score, comment, suggestion)

Be engaging, realistic, and challenging. Ask probing questions that test their knowledge and experience.`;
            } else {
                prompt = `You are starting a ${interviewTypeLabel} interview for a ${domain} position.

INTERVIEW TYPE: ${interviewType}
- Technical: Start with a coding challenge, system design question, or technical problem
- Culture Fit: Start with a behavioral question about their background, experience, or motivation
- DSA: Start with a data structure or algorithm problem

Provide:
1. A warm, professional opening from the AI interviewer
2. The first interview question
3. A natural AI response for voice synthesis
4. Real-time feedback (can be neutral for first question)

Make it feel like a real interview with a professional interviewer.`;
            }
        }

        const result = await generateText({
            model: google("gemini-2.0-flash"),
            system: `You are an expert AI Interview Coach conducting realistic mock interviews. You must respond in JSON format only.

INTERVIEW TYPES:
- Technical: Focus on coding, algorithms, system design, problem-solving
- Culture Fit: Focus on behavioral questions, teamwork, leadership, company culture
- DSA: Focus on data structures, algorithms, LeetCode-style problems with code solutions

RESPONSE FORMAT (JSON only):
{
  "interview_phase": "conversation" | "feedback",
  "ai_message": "Natural conversational AI interviewer response",
  "conversation_count": 1,
  "domain": "Role/domain",
  "interview_type": "technical" | "culture-fit" | "dsa",
  "dsa_question": {
    "title": "Problem title",
    "description": "Problem description",
    "difficulty": "easy" | "medium" | "hard",
    "examples": ["example1", "example2"],
    "constraints": ["constraint1", "constraint2"],
    "test_cases": [{"input": "input", "output": "output", "explanation": "explanation"}]
  },
  "feedback": {
    "overall_score": 0-100,
    "strengths": ["strength1", "strength2"],
    "areas_for_improvement": ["area1", "area2"],
    "detailed_analysis": "Comprehensive analysis",
    "recommendations": ["rec1", "rec2"],
    "next_steps": "Action items",
    "code_analysis": {
      "correctness": 0-100,
      "efficiency": 0-100,
      "readability": 0-100,
      "time_complexity": "O(n)",
      "space_complexity": "O(1)",
      "suggestions": ["suggestion1", "suggestion2"]
    }
  }
}

GUIDELINES:
- Be conversational and realistic in AI responses
- Ask follow-up questions based on responses
- Give hints when candidates struggle
- Ask freely without limiting question count
- Show genuine interest in their background
- Make the experience feel authentic and engaging
- Don't show questions as text - only AI responses
- Be encouraging and supportive
- For DSA: Present LeetCode-style problems with examples and test cases
- For DSA: Analyze code for correctness, efficiency, and complexity`,
            prompt: prompt,
            maxTokens: 1500,
        });

        console.log("✅ Interview agent response received");
        
        // Parse the response
        let cleanedContent = result.text.trim();
        cleanedContent = cleanedContent.replace('```json', '').replace('```', '');
        
        try {
            const parsedResponse = JSON.parse(cleanedContent);
            // Ensure interview_type is included
            parsedResponse.interview_type = interviewType;
            console.log("✅ Successfully parsed interview response");
            return NextResponse.json(parsedResponse);
        } catch (parseError) {
            console.error("Error parsing interview response:", parseError);
            // Fallback response
            const fallbackQuestion = interviewType === 'technical' 
                ? "Can you walk me through how you would approach solving a complex technical problem?"
                : "Tell me about a time when you had to work with a difficult team member. How did you handle it?";
            
            const fallbackResponse = {
                interview_phase: isFeedback ? "feedback" : "conversation",
                ai_message: isFeedback ? "" : (conversationMode ? 
                    (interviewType === 'dsa' ? 
                        `Hello! Welcome to your DSA interview for the ${domain} position. I'm excited to see how you approach algorithmic problems. Let's start with a problem - can you solve the "Two Sum" problem?` :
                        `Hello! Welcome to your ${interviewTypeLabel} interview for the ${domain} position. I'm excited to learn more about you. Could you start by telling me a bit about yourself and your background?`
                    ) :
                    `Great! Let's start with this question. ${fallbackQuestion}`
                ),
                conversation_count: 1,
                domain: domain,
                interview_type: interviewType,
                dsa_question: interviewType === 'dsa' && !isFeedback ? {
                    title: "Two Sum",
                    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
                    difficulty: "easy",
                    examples: [
                        "Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: Because nums[0] + nums[1] == 9, we return [0, 1].",
                        "Input: nums = [3,2,4], target = 6\nOutput: [1,2]",
                        "Input: nums = [3,3], target = 6\nOutput: [0,1]"
                    ],
                    constraints: [
                        "2 <= nums.length <= 10^4",
                        "-10^9 <= nums[i] <= 10^9",
                        "-10^9 <= target <= 10^9",
                        "Only one valid answer exists."
                    ],
                    test_cases: [
                        { input: "[2,7,11,15], 9", output: "[0,1]", explanation: "nums[0] + nums[1] = 2 + 7 = 9" },
                        { input: "[3,2,4], 6", output: "[1,2]", explanation: "nums[1] + nums[2] = 2 + 4 = 6" }
                    ]
                } : undefined,
                feedback: isFeedback ? {
                    overall_score: 75,
                    strengths: ["Good communication", "Relevant experience"],
                    areas_for_improvement: ["Could provide more specific examples"],
                    detailed_analysis: "The response shows good understanding but could be more detailed.",
                    recommendations: ["Provide specific examples", "Quantify achievements"],
                    next_steps: "Practice with more specific examples and metrics.",
                    code_analysis: interviewType === 'dsa' ? {
                        correctness: 80,
                        efficiency: 75,
                        readability: 85,
                        time_complexity: "O(n)",
                        space_complexity: "O(n)",
                        suggestions: ["Consider edge cases", "Add comments for clarity"]
                    } : undefined
                } : null
            };
            return NextResponse.json(fallbackResponse);
        }
        
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ 
            error: "Internal server error" 
        }, { status: 500 });
    }
}
