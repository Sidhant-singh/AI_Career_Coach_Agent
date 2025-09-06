/**
 * Script to prepare fine-tuning data for Falcon model
 * This creates training data for technical interview judging
 */

const fs = require('fs');
const path = require('path');

// Sample training data for technical interview judging
const trainingData = [
  // Technical Interview Examples
  {
    question: "Explain how you would design a URL shortening service like bit.ly",
    candidateResponse: "I would use a hash function to generate short URLs. For the database, I'd use Redis for caching and PostgreSQL for persistence. I'd also implement rate limiting and analytics.",
    domain: "Software Engineer",
    interviewType: "technical",
    expectedScores: {
      clarity: 85,
      communication: 80,
      technicalDepth: 90,
      fluency: 85,
      relevance: 95,
      structure: 75
    },
    feedback: {
      strengths: ["Good understanding of system design", "Mentioned appropriate technologies"],
      weaknesses: ["Could elaborate on specific implementation details", "Missing scalability considerations"],
      suggestions: ["Discuss database schema design", "Explain how to handle high traffic"]
    }
  },
  {
    question: "Write a function to find the longest common subsequence between two strings",
    candidateResponse: "I would use dynamic programming. Create a 2D array where dp[i][j] represents the LCS length for the first i characters of string1 and first j characters of string2.",
    domain: "Software Engineer",
    interviewType: "technical",
    expectedScores: {
      clarity: 90,
      communication: 85,
      technicalDepth: 95,
      fluency: 80,
      relevance: 100,
      structure: 85
    },
    feedback: {
      strengths: ["Correct algorithmic approach", "Clear explanation of DP concept"],
      weaknesses: ["Missing code implementation", "Could explain time/space complexity"],
      suggestions: ["Provide actual code implementation", "Discuss time and space complexity"]
    }
  },
  {
    question: "How would you optimize a slow database query?",
    candidateResponse: "I'd first analyze the query execution plan, then add appropriate indexes, optimize the query structure, and consider database partitioning if needed.",
    domain: "Software Engineer",
    interviewType: "technical",
    expectedScores: {
      clarity: 80,
      communication: 75,
      technicalDepth: 85,
      fluency: 70,
      relevance: 90,
      structure: 80
    },
    feedback: {
      strengths: ["Good systematic approach", "Mentioned key optimization techniques"],
      weaknesses: ["Could be more specific about index types", "Missing monitoring and measurement"],
      suggestions: ["Explain different types of indexes", "Discuss query profiling and monitoring"]
    }
  },
  // Culture Fit Interview Examples
  {
    question: "Tell me about a time when you had to work with a difficult team member",
    candidateResponse: "I once worked with someone who was always negative and resistant to new ideas. I tried to understand their perspective, found common ground, and focused on our shared goals to move forward productively.",
    domain: "Software Engineer",
    interviewType: "culture-fit",
    expectedScores: {
      clarity: 85,
      communication: 90,
      technicalDepth: 60,
      fluency: 85,
      relevance: 95,
      structure: 80
    },
    feedback: {
      strengths: ["Good conflict resolution approach", "Shows emotional intelligence"],
      weaknesses: ["Could provide more specific examples", "Missing measurable outcomes"],
      suggestions: ["Provide specific examples of actions taken", "Quantify the results achieved"]
    }
  },
  {
    question: "How do you handle tight deadlines and pressure?",
    candidateResponse: "I prioritize tasks based on impact and urgency, communicate regularly with stakeholders about progress, and break down large tasks into manageable chunks. I also make sure to take breaks to maintain quality.",
    domain: "Software Engineer",
    interviewType: "culture-fit",
    expectedScores: {
      clarity: 90,
      communication: 85,
      technicalDepth: 70,
      fluency: 80,
      relevance: 95,
      structure: 85
    },
    feedback: {
      strengths: ["Good time management approach", "Shows self-awareness"],
      weaknesses: ["Could provide specific examples", "Missing discussion of quality vs speed trade-offs"],
      suggestions: ["Share specific examples of handling pressure", "Discuss how you maintain quality under pressure"]
    }
  },
  // Poor Response Examples (for contrast)
  {
    question: "Explain the difference between SQL and NoSQL databases",
    candidateResponse: "SQL is like regular databases and NoSQL is different. SQL has tables and NoSQL doesn't. They're both used for storing data.",
    domain: "Software Engineer",
    interviewType: "technical",
    expectedScores: {
      clarity: 40,
      communication: 35,
      technicalDepth: 20,
      fluency: 30,
      relevance: 60,
      structure: 25
    },
    feedback: {
      strengths: ["Attempted to answer the question"],
      weaknesses: ["Very vague and unclear", "Lacks technical depth", "Poor communication"],
      suggestions: ["Study database fundamentals", "Practice explaining technical concepts clearly", "Provide specific examples"]
    }
  }
];

// Convert to Hugging Face format for fine-tuning
function convertToHuggingFaceFormat(data) {
  return data.map(item => {
    const prompt = `You are an expert technical interview judge. Evaluate this response:

Question: "${item.question}"
Response: "${item.candidateResponse}"
Domain: ${item.domain}
Type: ${item.interviewType}

Provide detailed scoring and feedback.`;

    const completion = JSON.stringify({
      overallScore: Math.round(Object.values(item.expectedScores).reduce((a, b) => a + b, 0) / 6),
      parameters: item.expectedScores,
      detailedAnalysis: item.feedback,
      confidence: 90
    });

    return {
      prompt: prompt,
      completion: completion
    };
  });
}

// Generate more training data programmatically
function generateMoreTrainingData() {
  const domains = ["Software Engineer", "Data Scientist", "Product Manager", "DevOps Engineer"];
  const technicalQuestions = [
    "How would you implement a caching layer for a web application?",
    "Explain the CAP theorem and its implications for distributed systems",
    "How would you handle a memory leak in a production application?",
    "Describe the difference between microservices and monolithic architecture",
    "How would you implement authentication and authorization in a web app?"
  ];
  
  const cultureFitQuestions = [
    "Describe a time when you had to learn a new technology quickly",
    "How do you stay updated with the latest industry trends?",
    "Tell me about a project where you had to collaborate with multiple teams",
    "How do you handle code reviews and feedback?",
    "Describe a time when you had to make a difficult technical decision"
  ];

  const additionalData = [];

  // Generate technical interview data
  technicalQuestions.forEach(question => {
    domains.forEach(domain => {
      // Good response
      additionalData.push({
        question,
        candidateResponse: generateGoodTechnicalResponse(question),
        domain,
        interviewType: "technical",
        expectedScores: generateGoodScores(),
        feedback: generateGoodFeedback()
      });

      // Average response
      additionalData.push({
        question,
        candidateResponse: generateAverageTechnicalResponse(question),
        domain,
        interviewType: "technical",
        expectedScores: generateAverageScores(),
        feedback: generateAverageFeedback()
      });
    });
  });

  // Generate culture fit data
  cultureFitQuestions.forEach(question => {
    domains.forEach(domain => {
      additionalData.push({
        question,
        candidateResponse: generateGoodCultureFitResponse(question),
        domain,
        interviewType: "culture-fit",
        expectedScores: generateGoodCultureFitScores(),
        feedback: generateGoodCultureFitFeedback()
      });
    });
  });

  return additionalData;
}

function generateGoodTechnicalResponse(question) {
  const responses = [
    "I would approach this by first understanding the requirements, then designing a scalable solution using appropriate technologies. Let me break this down into components...",
    "This is a great question. I'd start by analyzing the problem space, considering different approaches, and then implement the most suitable solution with proper error handling and testing.",
    "I've worked on similar problems before. The key is to understand the trade-offs and choose the right architecture. Here's how I would approach it..."
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

function generateAverageTechnicalResponse(question) {
  const responses = [
    "I think I would use some kind of database and maybe some caching. It depends on the specific requirements.",
    "I'm not entirely sure about this, but I would probably look it up and try to implement something that works.",
    "This is a complex topic. I would need to research more about it before giving a complete answer."
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

function generateGoodCultureFitResponse(question) {
  const responses = [
    "I can share a specific example from my previous role where I had to handle a similar situation. Here's what happened and how I approached it...",
    "This is something I've encountered before. Let me walk you through the situation, the actions I took, and the results we achieved.",
    "I believe in being proactive and collaborative. In this situation, I would first understand the context, then work with the team to find a solution."
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

function generateGoodScores() {
  return {
    clarity: 85 + Math.floor(Math.random() * 10),
    communication: 80 + Math.floor(Math.random() * 15),
    technicalDepth: 85 + Math.floor(Math.random() * 10),
    fluency: 80 + Math.floor(Math.random() * 15),
    relevance: 90 + Math.floor(Math.random() * 10),
    structure: 80 + Math.floor(Math.random() * 15)
  };
}

function generateAverageScores() {
  return {
    clarity: 60 + Math.floor(Math.random() * 15),
    communication: 55 + Math.floor(Math.random() * 20),
    technicalDepth: 50 + Math.floor(Math.random() * 25),
    fluency: 60 + Math.floor(Math.random() * 20),
    relevance: 70 + Math.floor(Math.random() * 15),
    structure: 55 + Math.floor(Math.random() * 20)
  };
}

function generateGoodCultureFitScores() {
  return {
    clarity: 85 + Math.floor(Math.random() * 10),
    communication: 90 + Math.floor(Math.random() * 10),
    technicalDepth: 60 + Math.floor(Math.random() * 20),
    fluency: 85 + Math.floor(Math.random() * 10),
    relevance: 90 + Math.floor(Math.random() * 10),
    structure: 80 + Math.floor(Math.random() * 15)
  };
}

function generateGoodFeedback() {
  return {
    strengths: ["Strong technical understanding", "Clear communication", "Good problem-solving approach"],
    weaknesses: ["Could provide more specific examples", "Missing some edge cases"],
    suggestions: ["Provide more concrete examples", "Consider scalability aspects"]
  };
}

function generateAverageFeedback() {
  return {
    strengths: ["Attempted to answer the question", "Shows some understanding"],
    weaknesses: ["Lacks depth and specificity", "Could improve communication"],
    suggestions: ["Study the topic more thoroughly", "Practice explaining technical concepts"]
  };
}

function generateGoodCultureFitFeedback() {
  return {
    strengths: ["Good communication skills", "Shows emotional intelligence", "Provides relevant examples"],
    weaknesses: ["Could quantify results better", "Missing some specific details"],
    suggestions: ["Add measurable outcomes", "Provide more specific examples"]
  };
}

// Main execution
function main() {
  console.log("🚀 Preparing Falcon fine-tuning data...");
  
  // Combine original and generated data
  const allData = [...trainingData, ...generateMoreTrainingData()];
  
  // Convert to Hugging Face format
  const hfFormat = convertToHuggingFaceFormat(allData);
  
  // Save training data
  const outputPath = path.join(__dirname, '../data/falcon-interview-training.json');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(hfFormat, null, 2));
  
  console.log(`✅ Generated ${hfFormat.length} training examples`);
  console.log(`📁 Saved to: ${outputPath}`);
  
  // Create a smaller validation set
  const validationData = hfFormat.slice(0, Math.floor(hfFormat.length * 0.2));
  const validationPath = path.join(__dirname, '../data/falcon-interview-validation.json');
  fs.writeFileSync(validationPath, JSON.stringify(validationData, null, 2));
  
  console.log(`📊 Created validation set with ${validationData.length} examples`);
  console.log(`📁 Validation data: ${validationPath}`);
  
  // Create training script
  const trainingScript = `#!/bin/bash
# Falcon Fine-tuning Script
# Make sure you have the Hugging Face transformers library installed

python -m transformers.trainer \\
  --model_name_or_path tiiuae/falcon-7b-instruct \\
  --train_file ../data/falcon-interview-training.json \\
  --validation_file ../data/falcon-interview-validation.json \\
  --output_dir ./falcon-interview-judge \\
  --num_train_epochs 3 \\
  --per_device_train_batch_size 1 \\
  --per_device_eval_batch_size 1 \\
  --gradient_accumulation_steps 4 \\
  --learning_rate 5e-5 \\
  --warmup_steps 100 \\
  --logging_steps 10 \\
  --save_steps 500 \\
  --eval_steps 500 \\
  --evaluation_strategy steps \\
  --save_strategy steps \\
  --load_best_model_at_end true \\
  --metric_for_best_model eval_loss \\
  --greater_is_better false \\
  --fp16 \\
  --dataloader_num_workers 4 \\
  --remove_unused_columns false \\
  --push_to_hub false
`;

  const scriptPath = path.join(__dirname, '../scripts/train-falcon-model.sh');
  fs.writeFileSync(scriptPath, trainingScript);
  fs.chmodSync(scriptPath, '755');
  
  console.log(`🔧 Created training script: ${scriptPath}`);
  console.log("🎯 Ready for fine-tuning! Run the training script to start fine-tuning Falcon.");
}

if (require.main === module) {
  main();
}

module.exports = {
  convertToHuggingFaceFormat,
  generateMoreTrainingData,
  trainingData
};










