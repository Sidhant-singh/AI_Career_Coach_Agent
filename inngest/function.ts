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
    system : `You are a helpful, professional AI career coach Agent. Your role is to guide users with skill development, career transitions, and industry trends.Always respond with clarity, encouragement, and and actionable advice.
    If the user asks anything unrelated to career (e.g. topics like health, relationships, coding etc.), politely redirect them back to career-related topics.`,
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
    const { userInput } = event.data;

    // DO NOT wrap agent.run inside step.run
    const result = await AiCareerChatAgent.run(userInput);
    //console.log("AiCareerAgent response:", result);

    return result;
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



// import { google } from "@ai-sdk/google";
// import { generateText } from "ai";

// export const AIRoadmapAgent = inngest.createFunction(
//   { 
//     id: 'AiRoadMapAgent',
//     name: 'AI Roadmap Generator',
//   },
//   { event: 'AiRoadMapAgent' },
//   async ({ event, step }) => {
//     console.log("🚀 AIRoadmapAgent started with event:", JSON.stringify(event, null, 2));
    
//     try {
//       const { roadmapId, userInput, userEmail } = event.data;
      
//       console.log("📝 Extracted data:", { roadmapId, userInput, userEmail });

//       if (!userInput) {
//         console.error("❌ Missing userInput in event data");
//         return {
//           success: false,
//           error: "Missing userInput",
//           message: "User input is required to generate roadmap",
//           roadmapId: roadmapId
//         };
//       }

//       // Check if Google API key is available
//       if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY && !process.env.GEMINI_API_KEY) {
//         console.error("❌ Missing Google API key");
//         return {
//           success: false,
//           error: "Missing API key",
//           message: "Google Generative AI API key is not configured",
//           roadmapId: roadmapId
//         };
//       }

//       const roadmapResult = await step.run("generate-roadmap", async () => {
//         console.log("🤖 Generating roadmap for input:", userInput);
        
//         const systemPrompt = `You are an expert learning roadmap generator. Generate a comprehensive React flow tree-structured learning roadmap based on the user's input position/skills.

// IMPORTANT: Always respond with ONLY valid JSON - no markdown formatting, no code blocks, no extra text.

// The roadmap should have:
// - Vertical tree structure with meaningful x/y positions to form a logical flow
// - Structure similar to roadmap.sh layout
// - Steps ordered from fundamentals to advanced
// - Include branching for different specializations (if applicable)
// - Each node must have a title, short description, and learning resource link
// - Use unique IDs for all nodes and edges
// - Make node positions spacious (minimum 200px apart vertically, 300px horizontally for branches)

// Response format (ONLY JSON, no markdown):
// {
//   "roadmapTitle": "Complete Learning Path Title",
//   "description": "A comprehensive 3-5 line description explaining what this roadmap covers, the target audience, and expected outcomes upon completion.",
//   "duration": "Estimated completion time (e.g., 6-12 months)",
//   "initialNodes": [
//     {
//       "id": "1",
//       "type": "turbo",
//       "position": { "x": 400, "y": 0 },
//       "data": {
//         "title": "Fundamentals",
//         "description": "Start with the basic concepts and foundational knowledge required for this field.",
//         "link": "https://example.com/fundamentals"
//       }
//     },
//     {
//       "id": "2", 
//       "type": "turbo",
//       "position": { "x": 400, "y": 200 },
//       "data": {
//         "title": "Next Step",
//         "description": "Build upon fundamentals with more specific skills and practical applications.",
//         "link": "https://example.com/next-step"
//       }
//     }
//   ],
//   "initialEdges": [
//     {
//       "id": "e1-2",
//       "source": "1",
//       "target": "2"
//     }
//   ]
// }

// Guidelines:
// - Include 8-15 nodes for comprehensive coverage
// - Position nodes with adequate spacing (200px+ vertically)
// - Include realistic learning resource links (documentation, courses, etc.)
// - Create logical dependencies with edges
// - For specializations, branch horizontally with different x coordinates
// - Always include practical projects/hands-on nodes
// - End with advanced/specialized topics

// Remember: Return ONLY the JSON object, no other text or formatting.`;

//         try {
//           const result = await generateText({
//             model: google("gemini-2.0-flash-exp"),
//             system: systemPrompt,
//             prompt: `Generate a learning roadmap for: ${userInput}`,
//             maxTokens: 4000,
//           });

//           console.log("✅ Generated text length:", result.text.length);
//           console.log("📄 Generated text preview:", result.text.substring(0, 200) + "...");
          
//           // Clean the response - remove any markdown formatting
//           let cleanedText = result.text.trim();
          
//           // Remove markdown code blocks if present
//           cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
          
//           // Find JSON object in the response
//           const jsonStart = cleanedText.indexOf('{');
//           const jsonEnd = cleanedText.lastIndexOf('}') + 1;
          
//           if (jsonStart === -1 || jsonEnd === 0) {
//             throw new Error("No JSON object found in response");
//           }
          
//           const jsonString = cleanedText.substring(jsonStart, jsonEnd);
          
//           try {
//             const parsedRoadmap = JSON.parse(jsonString);
//             console.log("✅ Successfully parsed roadmap JSON");
//             console.log("📊 Roadmap nodes count:", parsedRoadmap.initialNodes?.length || 0);
//             return parsedRoadmap;
//           } catch (parseError) {
//             console.error("❌ Failed to parse JSON:", parseError);
//             console.error("🔍 Cleaned text:", cleanedText);
            
//             // Return a fallback roadmap structure
//             const fallbackRoadmap = {
//               roadmapTitle: `${userInput} Learning Path`,
//               description: `A comprehensive learning roadmap for ${userInput}. This roadmap covers essential skills, tools, and concepts needed to excel in this field. Designed for beginners to advanced learners with practical hands-on experience.`,
//               duration: "6-12 months",
//               initialNodes: [
//                 {
//                   id: "1",
//                   type: "turbo",
//                   position: { x: 400, y: 0 },
//                   data: {
//                     title: "Getting Started",
//                     description: `Begin your ${userInput} journey with foundational concepts and basic understanding.`,
//                     link: "https://developer.mozilla.org/"
//                   }
//                 },
//                 {
//                   id: "2",
//                   type: "turbo",
//                   position: { x: 400, y: 200 },
//                   data: {
//                     title: "Core Concepts",
//                     description: `Learn the fundamental principles and core concepts of ${userInput}.`,
//                     link: "https://docs.github.com/"
//                   }
//                 },
//                 {
//                   id: "3",
//                   type: "turbo",
//                   position: { x: 400, y: 400 },
//                   data: {
//                     title: "Practical Application",
//                     description: `Apply your knowledge through hands-on projects and real-world scenarios.`,
//                     link: "https://github.com/"
//                   }
//                 }
//               ],
//               initialEdges: [
//                 {
//                   id: "e1-2",
//                   source: "1",
//                   target: "2"
//                 },
//                 {
//                   id: "e2-3",
//                   source: "2",
//                   target: "3"
//                 }
//               ]
//             };
            
//             console.log("🔄 Using fallback roadmap");
//             return fallbackRoadmap;
//           }
//         } catch (aiError) {
//           console.error("❌ AI generation error:", aiError);
//           throw new Error(`AI generation failed: ${aiError instanceof Error ? aiError.message : 'Unknown error'}`);
//         }
//       });
      
//       console.log("✅ Roadmap generation completed successfully");
      
//       // Optional: Save to database
//     //   if (roadmapId && userEmail) {
//     //     await step.run("save-to-db", async () => {
//     //       console.log("💾 Saving roadmap to database:", { roadmapId, userEmail });
//     //       // Add your database save logic here if needed
//     //       return true;
//     //     });
//     //   }
      
//     //   // Return the roadmap in the expected format
//     //   const response = {
//     //     success: true,
//     //     roadmap: roadmapResult,
//     //     roadmapId: roadmapId,
//     //     timestamp: new Date().toISOString()
//     //   };
      
//     //   console.log("🎉 Function completed successfully");
//     //   return response;
      
//     // } catch (error) {
//     //   console.error("💥 Critical error in AIRoadmapAgent:", error);
      
//     //   // Return error response instead of throwing
//     //   const errorResponse = {
//     //     success: false,
//     //     error: "Failed to generate roadmap",
//     //     message: error instanceof Error ? error.message : "Unknown error occurred",
//     //     roadmapId: event.data?.roadmapId || null,
//     //     timestamp: new Date().toISOString()
//     //   };
      
//     //   console.log("❌ Returning error response:", errorResponse);
//     //   return errorResponse;
      
//   }
// });

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