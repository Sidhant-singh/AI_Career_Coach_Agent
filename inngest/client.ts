import { Inngest } from "inngest";

// Create a client to send and receive events
export const inngest = new Inngest({ 
  id: "ai-career-coach-agent",
  // Add event key for cloud deployment
  eventKey: process.env.INNGEST_EVENT_KEY,
  // Add signing key for cloud deployment
  signingKey: process.env.INNGEST_SIGNING_KEY,
});
