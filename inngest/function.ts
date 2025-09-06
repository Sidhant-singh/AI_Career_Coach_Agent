import { gemini } from "inngest";
import { inngest } from "./client";
import { createAgent } from '@inngest/agent-kit';
import ImageKit from "imagekit";
import { db } from "@/configs/db";
import { HistoryTable } from "@/configs/schema";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    await step.sleep("wait-a-moment", "1s");
    return { message: `Hello ${event.data.email}!` };
  },
);

export const AiCareerChatAgent = createAgent({
    name : 'ai-career-chat-agent',
    description : 'An AI agent that helps you with career-related questions and tasks.',
    system : `You are a friendly, professional AI career coach having a natural conversation with someone seeking career guidance. Your role is to:

CONVERSATION STYLE:
- Be conversational, warm, and engaging like talking to a friend who's also a career expert
- Ask follow-up questions to understand their situation better
- Build on previous parts of the conversation naturally
- Show genuine interest in their career journey
- Use "you" and "your" to make it personal
- Be encouraging and supportive while giving honest advice

CAREER GUIDANCE AREAS:
- Skill development and learning paths
- Career transitions and changes
- Industry trends and insights
- Job search strategies
- Interview preparation
- Professional networking
- Salary negotiations
- Work-life balance
- Leadership development
- Entrepreneurship

CONVERSATION FLOW:
- If they mention a specific role/industry, ask about their experience level and goals
- If they're considering a career change, explore their current situation and motivations
- If they're job searching, understand their target roles and challenges
- If they're looking to upskill, assess their current skills and learning preferences
- Always provide actionable next steps and resources when relevant

REDIRECTION:
- If they ask about non-career topics (health, relationships, general coding tutorials), politely redirect: "I'd love to help with that, but I'm specialized in career guidance. Is there anything career-related I can help you with instead?"

Remember: This is a conversation, not just Q&A. Build rapport, ask thoughtful questions, and create a supportive coaching relationship.`,
    model : gemini({
      model : "gemini-2.0-flash",
      apiKey : process.env.GEMINI_API_KEY,
    })
})

export const AiResumeAnalyzerAgent = createAgent({
  name: 'AiResumeAnalyzerAgent',
  description: 'An agent that analyzes resumes and provides structured feedback as a JSON report.',
  system: `
You are an advanced AI Resume Analyzer Agent.
Your task is to evaluate a candidate's resume and return a detailed analysis in the following structured JSON schema format.
The schema must match the layout and structure of a visual UI that includes overall score, section scores, summary feedback, improvement tips, strengths, and weaknesses.

📤 INPUT: I will provide a plain text resume.
🎯 GOAL: Output a JSON report as per the schema below. The report should reflect:

- overall_score (0–100)
- overall_feedback (short message e.g., "Excellent", "Needs improvement")
- summary_comment (1–2 sentence evaluation summary)

Section scores for:
- Contact Info
- Experience
- Education
- Skills

Each section should include:
- score (as percentage)
- Optional comment about that section

Also include:
- tips_for_improvement (3–5 tips)
- whats_good (1–3 strengths)
- needs_improvement (1–3 weaknesses)

🧠 Output JSON Schema:
{
  "overall_score": 85,
  "overall_feedback": "Excellent!",
  "summary_comment": "Your resume is strong, but there are areas to refine.",
  "sections": {
    "contact_info": {
      "score": 95,
      "comment": "Perfectly structured and complete."
    },
    "experience": {
      "score": 88,
      "comment": "Strong bullet points and impact."
    },
    "education": {
      "score": 70,
      "comment": "Consider adding relevant coursework."
    },
    "skills": {
      "score": 60,
      "comment": "Expand on specific skill proficiencies."
    }
  },
  "tips_for_improvement": [
    "Add more numbers and metrics to your experience section to show impact.",
    "Integrate more industry-specific keywords relevant to your target roles.",
    "Start bullet points with strong action verbs to make your achievements stand out."
  ],
  "whats_good": [
    "Clean and professional formatting.",
    "Clear and concise contact information.",
    "Relevant work experience."
  ],
  "needs_improvement": [
    "Skills section lacks detail.",
    "Some experience bullet points could be stronger.",
    "Missing a professional summary/objective."
  ]
}
`,
  model: gemini({
    model: "gemini-2.0-flash",
    apiKey: process.env.GEMINI_API_KEY,
  }),
});

export const AiInterviewAgent = createAgent({
  name: 'AiInterviewAgent',
  description: 'An AI agent that conducts dynamic mock interviews with realistic voice responses and real-time judging.',
  system: `You are an expert AI Interview Coach conducting realistic mock interviews. You must respond in JSON format only.

INTERVIEW TYPES:
- Technical: Focus on coding, algorithms, system design, problem-solving
- Culture Fit: Focus on behavioral questions, teamwork, leadership, company culture

RESPONSE FORMAT (JSON only):
{
  "interview_phase": "question" | "feedback",
  "current_question": "The interview question to ask",
  "question_number": 1-8,
  "total_questions": 8,
  "domain": "Role/domain",
  "interview_type": "technical" | "culture-fit",
  "ai_response": "Dynamic AI interviewer response for voice synthesis (natural, conversational)",
  "real_time_feedback": {
    "score": 0-100,
    "comment": "Brief real-time assessment",
    "suggestion": "Quick improvement tip"
  },
  "feedback": {
    "overall_score": 0-100,
    "strengths": ["strength1", "strength2"],
    "areas_for_improvement": ["area1", "area2"],
    "detailed_analysis": "Comprehensive analysis",
    "recommendations": ["rec1", "rec2"],
    "next_steps": "Action items"
  }
}

GUIDELINES:
- Be conversational and realistic in AI responses
- Provide real-time feedback during questions
- Ask follow-up questions based on responses
- Judge responses like a real interviewer
- Keep questions relevant to the domain and interview type
- Make the experience feel authentic and challenging`,
  model: gemini({
    model: "gemini-2.0-flash",
    apiKey: process.env.GEMINI_API_KEY,
  }),
});


// export const AIRoadmapGeneratorAgent = createAgent({
//   name : 'AIRoadmapGeneratorAgent',
//   description : 'Generate Details Tree Like Flow Roadmap',
//   system : `Generate a React flow tree-structured learning roadmap for user input position/ skills the following format:
//  vertical tree structure with meaningful x/y positions to form a flow

// - Structure should be similar to roadmap.sh layout
// - Steps should be ordered from fundamentals to advanced
// - Include branching for different specializations (if applicable)
// - Each node must have a title, short description, and learning resource link
// - Use unique IDs for all nodes and edges
// - make it more specious node position, 
// - Response n JSON format
// {
// roadmapTitle:'',
// description:<3-5 Lines>,
// duration:'',
// initialNodes : [
// {
//  id: '1',
//  type: 'turbo',
//  position: { x: 0, y: 0 },
//  data: {
// title: 'Step Title',
// description: 'Short two-line explanation of what the step covers.',
// link: 'Helpful link for learning this step',
//  },
// },
// ...
// ],
// initialEdges : [
// {
//  id: 'e1-2',
//  source: '1',
//  target: '2',
// },
// ...
// ];
// }

// `,
//   model: gemini({
//     model: "gemini-2.0-flash",
//     apiKey: process.env.GEMINI_API_KEY,
//   })
// })

export const AiCareerAgent = inngest.createFunction(
  { id: "AiCareerAgent" },
  { event: "AiCareerAgent" },
  async ({ event }) => {
    const { userInput, conversationHistory } = event.data;

    // Build conversation context if history exists
    let fullPrompt = userInput;
    if (conversationHistory && conversationHistory.length > 0) {
      // Format conversation history for context
      const historyContext = conversationHistory
        .slice(-10) // Keep last 10 exchanges to avoid token limits
        .map((msg: any) => {
          if (msg.role === 'user') {
            return `User: ${msg.content}`;
          } else {
            return `AI Career Coach: ${msg.content}`;
          }
        })
        .join('\n\n');
      
      fullPrompt = `Previous conversation context:\n${historyContext}\n\nCurrent user message: ${userInput}`;
    }

    // DO NOT wrap agent.run inside step.run
    const result = await AiCareerChatAgent.run(fullPrompt);
    console.log("AiCareerAgent response:", result);

    return result;
  }
);

export const AiInterviewAgentFunction = inngest.createFunction(
  { id: "AiInterviewAgent" },
  { event: "AiInterviewAgent" },
  async ({ event, step }) => {
    const { interviewId, userInput, domain, userEmail, interviewType, isFeedback } = event.data;

    console.log("🤖 AI Interview Agent started with:", { interviewId, domain, interviewType, isFeedback });

    const interviewResult = await step.run("conduct-interview", async () => {
      let prompt = "";
      
      if (isFeedback) {
        // Provide comprehensive feedback on the candidate's responses
        prompt = `You are conducting a ${interviewType} interview for a ${domain} position.

CANDIDATE'S RESPONSES:
${userInput}

INTERVIEW TYPE: ${interviewType}
- Technical: Focus on technical skills, problem-solving, coding ability, system design
- Culture Fit: Focus on behavioral aspects, teamwork, leadership, company culture fit

Provide comprehensive feedback including:
1. Overall performance score (0-100)
2. Strengths demonstrated
3. Areas for improvement
4. Detailed analysis of their responses
5. Specific recommendations
6. Next steps for improvement

Be thorough but constructive in your assessment.`;
      } else {
        // Generate dynamic interview questions and responses
        const questionType = interviewType === 'technical' ? 'technical' : 'behavioral/culture-fit';
        
        if (userInput) {
          // Follow-up based on previous response
          prompt = `You are conducting a ${interviewType} interview for a ${domain} position.

PREVIOUS CANDIDATE RESPONSE: "${userInput}"

INTERVIEW TYPE: ${interviewType}
- Technical: Ask coding challenges, system design, algorithms, technical problem-solving
- Culture Fit: Ask behavioral questions about teamwork, leadership, conflict resolution, company values

Based on their response, provide:
1. A natural, conversational AI interviewer response (like a real interviewer would speak)
2. A follow-up question that builds on their answer
3. Real-time feedback on their response (score, comment, suggestion)

Be engaging, realistic, and challenging. Ask probing questions that test their knowledge and experience.`;
        } else {
          // First question
          prompt = `You are starting a ${interviewType} interview for a ${domain} position.

INTERVIEW TYPE: ${interviewType}
- Technical: Start with a coding challenge, system design question, or technical problem
- Culture Fit: Start with a behavioral question about their background, experience, or motivation

Provide:
1. A warm, professional opening from the AI interviewer
2. The first interview question
3. A natural AI response for voice synthesis
4. Real-time feedback (can be neutral for first question)

Make it feel like a real interview with a professional interviewer.`;
        }
      }

      const result = await AiInterviewAgent.run(prompt);
      console.log("✅ Interview agent response received");
      
      // Parse the response
      const message = result.output[0];
      const rawContent = ('content' in message ? message.content : 'text' in message ? message.text : '') as string;
      const cleanedContent = rawContent.replace('```json', '').replace('```', '');
      
      try {
        const parsedResponse = JSON.parse(cleanedContent);
        // Ensure interview_type is included
        parsedResponse.interview_type = interviewType;
        return parsedResponse;
      } catch (parseError) {
        console.error("Error parsing interview response:", parseError);
        // Fallback response
        const fallbackQuestion = interviewType === 'technical' 
          ? "Can you walk me through how you would approach solving a complex technical problem?"
          : "Tell me about a time when you had to work with a difficult team member. How did you handle it?";
        
        return {
          interview_phase: isFeedback ? "feedback" : "question",
          current_question: isFeedback ? "" : fallbackQuestion,
          question_number: 1,
          total_questions: 8,
          domain: domain,
          interview_type: interviewType,
          ai_response: isFeedback ? "" : `Great! Let's start with this question. ${fallbackQuestion}`,
          real_time_feedback: isFeedback ? null : {
            score: 0,
            comment: "Let's see how you approach this question",
            suggestion: "Take your time and think through your response"
          },
          feedback: isFeedback ? {
            overall_score: 75,
            strengths: ["Good communication", "Relevant experience"],
            areas_for_improvement: ["Could provide more specific examples"],
            detailed_analysis: "The response shows good understanding but could be more detailed.",
            recommendations: ["Provide specific examples", "Quantify achievements"],
            next_steps: "Practice with more specific examples and metrics."
          } : null
        };
      }
    });

    // Save to database
    const saveToDb = await step.run('SaveToDb', async () => {
      const result = await db.insert(HistoryTable).values({
        recordId: interviewId,
        content: interviewResult,
        aiAgentType: '/ai-tools/ai-interview-agent',
        createdAt: (new Date()).toString(),
        userEmail: userEmail,
        metaData: domain
      });
      
      console.log("✅ Interview data saved to database");
      return interviewResult;
    });

    return {
      success: true,
      interviewData: saveToDb,
      interviewId: interviewId,
      timestamp: new Date().toISOString()
    };
  }
);

var imagekit = new ImageKit({
  // @ts-ignore
  publicKey : process.env.IMAGEKIT_PUBLIC_KEY,
  // @ts-ignore
  privateKey : process.env.IMAGEKIT_PRIVATE_KEY,
  // @ts-ignore
  urlEndpoint : process.env.IMAGE_ENDPOINT_URL
});

export const AiResumeAgent = inngest.createFunction(
  { id: 'AiResumeAgent' },
  { event: 'AiResumeAgent' },
  async ({ event, step }) => {
    const { recordId, base64ResumeFile, pdfText, aiAgentType,userEmail } = event.data;

    const uploadFileUrl = await step.run("uploadImage", async () => {
      const imageKitFile = await imagekit.upload({
        file: base64ResumeFile,
        fileName: `${Date.now()}.pdf`,
        isPublished: true,
      });

      console.log("ImageKit upload result:", imageKitFile);

      return imageKitFile.url;
    });

    const aiResumeReport = await AiResumeAnalyzerAgent.run(pdfText);
    // @ts-ignore
    const rawContent = aiResumeReport.output[0].content;
    const rawContentJson = rawContent.replace('```json','').replace('```','');
    const parseJson = JSON.parse(rawContentJson)

    // return {
    //   imageUrl: uploadImageUrl,
    //   recordId,
    //   pdfText,
    //   parseJson,
    // };
    const saveToDb = await step.run('SaveToDb',async()=>{
      const result = await db.insert(HistoryTable).values({
        recordId : recordId,
        content : parseJson,
        aiAgentType : aiAgentType,
        createdAt : (new Date()).toString(),
        userEmail : userEmail,
        metaData : uploadFileUrl
      });
      // possible error
      console.log(result);
      return parseJson;
    });
    return {
      imageUrl: uploadFileUrl,
      recordId,
      aiReport: saveToDb,  // the parsed JSON report
    };
  }
);


import { google } from "@ai-sdk/google";
import { generateText } from "ai";

export const AIRoadmapAgent = inngest.createFunction(
  { 
    id: 'AiRoadMapAgent',
    name: 'AI Roadmap Generator',
  },
  { event: 'AiRoadMapAgent' },
  async ({ event, step }) => {
    console.log("🚀 AIRoadmapAgent started with event:", JSON.stringify(event, null, 2));
    
    const { roadmapId, userInput, userEmail } = event.data;
    
    console.log("📝 Extracted data:", { roadmapId, userInput, userEmail });

    const roadmapResult = await step.run("generate-roadmap", async () => {
      console.log("🤖 Generating roadmap for input:", userInput);
      
      const systemPrompt = `You are an expert learning roadmap generator. Generate a comprehensive React flow tree-structured learning roadmap based on the user's input position/skills.

IMPORTANT: Always respond with ONLY valid JSON - no markdown formatting, no code blocks, no extra text.

The roadmap should have:
- Vertical tree structure with meaningful x/y positions to form a logical flow
- Structure similar to roadmap.sh layout
- Steps ordered from fundamentals to advanced
- Include branching for different specializations (if applicable)
- Each node must have a title, short description, and learning resource link
- Use unique IDs for all nodes and edges
- Make node positions spacious (minimum 200px apart vertically, 300px horizontally for branches)

Response format (ONLY JSON, no markdown):
{
  "roadmapTitle": "Complete Learning Path Title",
  "description": "A comprehensive 3-5 line description explaining what this roadmap covers, the target audience, and expected outcomes upon completion.",
  "duration": "Estimated completion time (e.g., 6-12 months)",
  "initialNodes": [
    {
      "id": "1",
      "type": "turbo",
      "position": { "x": 400, "y": 0 },
      "data": {
        "title": "Fundamentals",
        "description": "Start with the basic concepts and foundational knowledge required for this field.",
        "link": "https://example.com/fundamentals"
      }
    },
    {
      "id": "2", 
      "type": "turbo",
      "position": { "x": 400, "y": 200 },
      "data": {
        "title": "Next Step",
        "description": "Build upon fundamentals with more specific skills and practical applications.",
        "link": "https://example.com/next-step"
      }
    }
  ],
  "initialEdges": [
    {
      "id": "e1-2",
      "source": "1",
      "target": "2"
    }
  ]
}

Guidelines:
- Include 8-15 nodes for comprehensive coverage
- Position nodes with adequate spacing (200px+ vertically)
- Include realistic learning resource links (documentation, courses, etc.)
- Create logical dependencies with edges
- For specializations, branch horizontally with different x coordinates
- Always include practical projects/hands-on nodes
- End with advanced/specialized topics

Remember: Return ONLY the JSON object, no other text or formatting.`;

      const result = await generateText({
        model: google("gemini-2.0-flash-exp"),
        system: systemPrompt,
        prompt: `Generate a learning roadmap for: ${userInput}`,
        maxTokens: 4000,
      });

      console.log("✅ Generated text length:", result.text.length);
      console.log("📄 Generated text preview:", result.text.substring(0, 200) + "...");
      
      // Clean the response - remove any markdown formatting
      let cleanedText = result.text.trim();
      
      // Remove markdown code blocks if present
      cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      
      // Find JSON object in the response
      const jsonStart = cleanedText.indexOf('{');
      const jsonEnd = cleanedText.lastIndexOf('}') + 1;
      
      const jsonString = cleanedText.substring(jsonStart, jsonEnd);
      const parsedRoadmap = JSON.parse(jsonString);
      
      console.log("✅ Successfully parsed roadmap JSON");
      console.log("📊 Roadmap nodes count:", parsedRoadmap.initialNodes?.length || 0);
      
      return parsedRoadmap;
    });
    
    console.log("✅ Roadmap generation completed successfully");
    
    const response = {
      success: true,
      roadmap: roadmapResult,
      roadmapId: roadmapId,
      timestamp: new Date().toISOString()
    };
    
    // save to DB
    const saveToDb = await step.run('SaveToDb',async()=>{
      const result = await db.insert(HistoryTable).values({
        recordId : roadmapId,
        content : response.roadmap,
        aiAgentType : '/ai-tools/ai-roadmap-agent',
        createdAt : (new Date()).toString(),
        userEmail : userEmail,
        metaData : userInput
      });


    console.log("🎉 Function completed successfully");
    return response;
    });

  }
);
// running the inngest server -> npx inngest-cli@latest dev
// running the node server -> npm run dev
// running the database server -> npx drizzle-kit studio