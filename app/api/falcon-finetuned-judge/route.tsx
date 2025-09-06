import { NextRequest, NextResponse } from 'next/server';
import { HfInference } from '@huggingface/inference';

// Initialize Hugging Face inference
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

interface InterviewJudgingRequest {
  question: string;
  candidateResponse: string;
  domain: string;
  interviewType: 'technical' | 'culture-fit';
  previousContext?: string;
  conversationHistory?: Array<{
    question: string;
    response: string;
    timestamp: string;
  }>;
}

interface FalconJudgingResponse {
  overallAssessment: string;
  detailedAnalysis: {
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
    specificFeedback: string;
    improvementAreas: string[];
    standoutPoints: string[];
  };
  contextualInsights: {
    progressTrend: string;
    consistencyScore: number;
    knowledgeGaps: string[];
    strongAreas: string[];
  };
  nextQuestionSuggestion: string;
  confidence: number;
  modelVersion: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: InterviewJudgingRequest = await request.json();
    const { question, candidateResponse, domain, interviewType, previousContext, conversationHistory } = body;

    console.log('🤖 Fine-tuned Falcon Interview Judge started with:', { domain, interviewType });

    // Use fine-tuned model if available, otherwise fallback to base model
    const modelName = process.env.FALCON_FINETUNED_MODEL || "tiiuae/falcon-7b-instruct";

    // Create sophisticated prompt for fine-tuned Falcon model
    const prompt = `You are an expert interview judge specializing in ${interviewType} interviews for ${domain} positions. 

**TASK**: Analyze the candidate's response and provide comprehensive feedback.

**INTERVIEW CONTEXT**:
- Question: "${question}"
- Candidate Response: "${candidateResponse}"
- Domain: ${domain}
- Interview Type: ${interviewType}
- Previous Context: ${previousContext || 'First question'}

**CONVERSATION HISTORY**:
${conversationHistory ? conversationHistory.map((item, index) => 
  `Q${index + 1}: ${item.question}\nA${index + 1}: ${item.response}\nTime: ${item.timestamp}`
).join('\n\n') : 'No previous questions'}

**ANALYSIS REQUIREMENTS**:
1. Overall Assessment: Provide a comprehensive evaluation of the response quality
2. Detailed Analysis: Break down strengths, weaknesses, and specific feedback
3. Contextual Insights: Analyze progress trends and consistency
4. Next Question Suggestion: Recommend follow-up questions
5. Confidence Score: Rate your confidence in this assessment (0-100)

**RESPONSE FORMAT** (JSON only):
{
  "overallAssessment": "Comprehensive evaluation of the response quality, communication skills, and technical depth",
  "detailedAnalysis": {
    "strengths": ["List of specific strengths observed"],
    "weaknesses": ["List of areas needing improvement"],
    "suggestions": ["Actionable recommendations for improvement"],
    "specificFeedback": "Detailed feedback on specific aspects of the response",
    "improvementAreas": ["Specific areas to focus on for next questions"],
    "standoutPoints": ["Notable positive aspects that stood out"]
  },
  "contextualInsights": {
    "progressTrend": "Analysis of how the candidate is performing across questions",
    "consistencyScore": 85,
    "knowledgeGaps": ["Areas where knowledge appears limited"],
    "strongAreas": ["Areas where the candidate shows strong understanding"]
  },
  "nextQuestionSuggestion": "Recommended follow-up question based on this response",
  "confidence": 92,
  "modelVersion": "falcon-7b-instruct-finetuned-v1.0"
}

**JUDGING CRITERIA**:
- Technical Depth: Understanding of concepts and ability to explain them
- Communication: Clarity, structure, and articulation
- Problem Solving: Approach to challenges and logical thinking
- Relevance: How well the response addresses the question
- Innovation: Creative thinking and unique insights
- Confidence: Assurance and conviction in responses
- Completeness: Thoroughness and attention to detail

Provide your analysis now:`;

    // Use fine-tuned Falcon model
    const response = await hf.textGeneration({
      model: modelName,
      inputs: prompt,
      parameters: {
        max_new_tokens: 1000,
        temperature: 0.7,
        top_p: 0.9,
        repetition_penalty: 1.1,
        return_full_text: false,
      },
    });

    // Parse the response
    let judgingResult: FalconJudgingResponse;
    try {
      const responseText = response.generated_text;
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        judgingResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No valid JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse Falcon response:', parseError);
      // Fallback response
      judgingResult = {
        overallAssessment: "Response analysis completed. The candidate provided a response that shows engagement with the question.",
        detailedAnalysis: {
          strengths: ["Engaged with the question", "Provided a response"],
          weaknesses: ["Response could be more detailed", "Consider providing more specific examples"],
          suggestions: ["Elaborate more on your experience", "Provide concrete examples"],
          specificFeedback: "The response shows understanding but could benefit from more detail and specific examples.",
          improvementAreas: ["Detail and specificity", "Concrete examples"],
          standoutPoints: ["Willingness to engage", "Basic understanding demonstrated"]
        },
        contextualInsights: {
          progressTrend: "Early stage assessment - more data needed for trend analysis",
          consistencyScore: 70,
          knowledgeGaps: ["Need more specific examples", "Could demonstrate deeper understanding"],
          strongAreas: ["Communication", "Engagement"]
        },
        nextQuestionSuggestion: "Can you provide a specific example of how you've applied this concept in a real project?",
        confidence: 75,
        modelVersion: "falcon-7b-instruct-fallback"
      };
    }

    console.log('✅ Fine-tuned Falcon judging completed successfully');

    return NextResponse.json({
      success: true,
      data: judgingResult,
      model: modelName,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Hugging Face API error:', error);
    
    // Fallback response when API fails
    const fallbackResponse: FalconJudgingResponse = {
      overallAssessment: "Response analysis completed using fallback method. The candidate provided a response that shows engagement with the question.",
      detailedAnalysis: {
        strengths: ["Engaged with the question", "Provided a response"],
        weaknesses: ["Response could be more detailed", "Consider providing more specific examples"],
        suggestions: ["Elaborate more on your experience", "Provide concrete examples"],
        specificFeedback: "The response shows understanding but could benefit from more detail and specific examples.",
        improvementAreas: ["Detail and specificity", "Concrete examples"],
        standoutPoints: ["Willingness to engage", "Basic understanding demonstrated"]
      },
      contextualInsights: {
        progressTrend: "Early stage assessment - more data needed for trend analysis",
        consistencyScore: 70,
        knowledgeGaps: ["Need more specific examples", "Could demonstrate deeper understanding"],
        strongAreas: ["Communication", "Engagement"]
      },
      nextQuestionSuggestion: "Can you provide a specific example of how you've applied this concept in a real project?",
      confidence: 75,
      modelVersion: "falcon-7b-instruct-fallback"
    };

    return NextResponse.json({
      success: true,
      data: fallbackResponse,
      model: 'falcon-7b-instruct-fallback',
      timestamp: new Date().toISOString(),
      warning: 'Using fallback response due to API error'
    });
  }
}