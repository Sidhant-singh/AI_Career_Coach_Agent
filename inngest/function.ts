import { gemini } from "inngest";
import { inngest } from "./client";
import { createAgent } from '@inngest/agent-kit';
import ImageKit from "imagekit";

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


// export const AiCareerAgent  = inngest.createFunction(
//   {id : 'AiCareerAgent'},
//   {event : 'AiCareerAgent'},
//   async({event, step})=>{
//     const {userInput} = await event?.data;
//     const result = await AiCareerChatAgent.run(userInput);
//     return result;
//   }
// )

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
  publicKey : process.env.IMAGEKIT_PUBLIC_API_KEY,
  // @ts-ignore
  privateKey : process.env.IMAGEKIT_PRIVATE_KEY,
  // @ts-ignore
  urlEndpoint : process.env.IMAGE_ENDPOINT_URL
});

export const AiResumeAgent = inngest.createFunction(
    {id : 'AiResumeAgent'},
    {event : 'AiResumeAgent'},
    async({event, step})=>{
      const {recordId, base64ResumeFile, pdfText} =await event.data;
      // upload file to cloud storage

      
    }
)

// npx inngest-cli@latest dev
