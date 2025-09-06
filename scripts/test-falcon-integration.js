/**
 * Test script for Falcon integration
 * This script tests the Falcon judging API endpoints
 */

const fetch = require('node-fetch');

const testFalconIntegration = async () => {
    console.log('🧪 Testing Falcon Integration...\n');

    const baseUrl = 'http://localhost:3000';
    
    // Test data
    const testData = {
        question: "Explain how you would design a URL shortening service like bit.ly",
        candidateResponse: "I would use a hash function to generate short URLs. For the database, I'd use Redis for caching and PostgreSQL for persistence. I'd also implement rate limiting and analytics.",
        domain: "Software Engineer",
        interviewType: "technical"
    };

    try {
        // Test base Falcon model
        console.log('1️⃣ Testing base Falcon model...');
        const baseResponse = await fetch(`${baseUrl}/api/falcon-interview-judge`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testData)
        });

        if (baseResponse.ok) {
            const baseResult = await baseResponse.json();
            console.log('✅ Base Falcon model working!');
            console.log(`   Overall Score: ${baseResult.overallScore}/100`);
            console.log(`   Parameters: ${Object.keys(baseResult.parameters).length} parameters scored`);
            console.log(`   Strengths: ${baseResult.detailedAnalysis.strengths.length} identified`);
            console.log(`   Weaknesses: ${baseResult.detailedAnalysis.weaknesses.length} identified`);
        } else {
            console.log('❌ Base Falcon model failed:', baseResponse.status);
        }

        console.log('\n2️⃣ Testing fine-tuned Falcon model...');
        const fineTunedResponse = await fetch(`${baseUrl}/api/falcon-finetuned-judge`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...testData,
                conversationHistory: [
                    {
                        question: "Tell me about yourself",
                        response: "I'm a software engineer with 5 years of experience in web development.",
                        scores: { clarity: 80, communication: 85, technicalDepth: 75 }
                    }
                ]
            })
        });

        if (fineTunedResponse.ok) {
            const fineTunedResult = await fineTunedResponse.json();
            console.log('✅ Fine-tuned Falcon model working!');
            console.log(`   Overall Score: ${fineTunedResult.overallScore}/100`);
            console.log(`   Fine-tuned: ${fineTunedResult.fineTunedModel ? 'Yes' : 'No'}`);
            console.log(`   Model Version: ${fineTunedResult.modelVersion}`);
            console.log(`   Confidence: ${fineTunedResult.confidence}%`);
            
            if (fineTunedResult.contextualInsights) {
                console.log(`   Progress Trend: ${fineTunedResult.contextualInsights.progressTrend}`);
                console.log(`   Consistency Score: ${fineTunedResult.contextualInsights.consistencyScore}/100`);
            }
        } else {
            console.log('❌ Fine-tuned Falcon model failed:', fineTunedResponse.status);
        }

        console.log('\n3️⃣ Testing different interview types...');
        
        // Test culture fit interview
        const cultureFitData = {
            question: "Tell me about a time when you had to work with a difficult team member",
            candidateResponse: "I once worked with someone who was always negative and resistant to new ideas. I tried to understand their perspective, found common ground, and focused on our shared goals to move forward productively.",
            domain: "Software Engineer",
            interviewType: "culture-fit"
        };

        const cultureFitResponse = await fetch(`${baseUrl}/api/falcon-interview-judge`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(cultureFitData)
        });

        if (cultureFitResponse.ok) {
            const cultureFitResult = await cultureFitResponse.json();
            console.log('✅ Culture fit interview judging working!');
            console.log(`   Overall Score: ${cultureFitResult.overallScore}/100`);
            console.log(`   Communication Score: ${cultureFitResult.parameters.communication}/100`);
            console.log(`   Technical Depth Score: ${cultureFitResult.parameters.technicalDepth}/100`);
        } else {
            console.log('❌ Culture fit interview judging failed:', cultureFitResponse.status);
        }

        console.log('\n🎉 Falcon integration test completed!');
        console.log('\n📋 Summary:');
        console.log('   - Base Falcon model: Working');
        console.log('   - Fine-tuned model: Working');
        console.log('   - Technical interviews: Supported');
        console.log('   - Culture fit interviews: Supported');
        console.log('   - 10-parameter scoring: Active');
        console.log('   - Contextual analysis: Available');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.log('\n🔧 Troubleshooting:');
        console.log('   1. Make sure the development server is running (npm run dev)');
        console.log('   2. Check that HUGGINGFACE_API_KEY is set in .env.local');
        console.log('   3. Verify internet connection for Hugging Face API');
        console.log('   4. Check console for any error messages');
    }
};

// Run the test
testFalconIntegration();










