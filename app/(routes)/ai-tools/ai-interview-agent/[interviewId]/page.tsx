"use client";
import React, { useState, useEffect } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Mic, MicOff, Send, CheckCircle, AlertCircle, Volume2, VolumeX, Download, Clock } from 'lucide-react';
import Link from 'next/link';
import { generateInterviewPDF, downloadPDF, InterviewReportData } from '@/lib/pdf-generator';
import { useTalkingAvatar } from '@/lib/talking-avatar';

interface InterviewData {
    interview_phase: 'conversation' | 'feedback';
    ai_message?: string; // AI's conversational response
    domain: string;
    interview_type: 'technical' | 'culture-fit' | 'dsa';
    conversation_count: number; // Track conversation turns
    dsa_question?: {
        title: string;
        description: string;
        difficulty: 'easy' | 'medium' | 'hard';
        examples: string[];
        constraints: string[];
        test_cases: Array<{
            input: string;
            output: string;
            explanation?: string;
        }>;
    };
    feedback?: {
        overall_score: number;
        strengths: string[];
        areas_for_improvement: string[];
        detailed_analysis: string;
        recommendations: string[];
        next_steps: string;
        code_analysis?: {
            correctness: number;
            efficiency: number;
            readability: number;
            time_complexity: string;
            space_complexity: string;
            suggestions: string[];
        };
    };
}

interface InterviewResponse {
    question: string;
    answer: string;
    timestamp: string;
}

const InterviewPage: React.FC = () => {
    const searchParams = useSearchParams();
    const params = useParams();
    const { user } = useUser();
    const interviewId = params.interviewId as string || '';
    const domain = searchParams.get('domain') || '';
    const duration = parseInt(searchParams.get('duration') || '10');
    const interviewType = searchParams.get('type') as 'technical' | 'culture-fit' | 'dsa' || 'technical';

    const [interviewData, setInterviewData] = useState<InterviewData | null>(null);
    const [userResponse, setUserResponse] = useState('');
    const [codeResponse, setCodeResponse] = useState(''); // For DSA interviews
    const [selectedLanguage, setSelectedLanguage] = useState('javascript');
    const [loading, setLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [recognition, setRecognition] = useState<any>(null);
    const [isAISpeaking, setIsAISpeaking] = useState(false);
    const [interviewStarted, setInterviewStarted] = useState(false);
    const [showFeedback, setShowFeedback] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(duration * 60); // Convert to seconds
    const [conversationHistory, setConversationHistory] = useState<Array<{
        ai_message: string;
        user_response: string;
        timestamp: string;
    }>>([]);
    const [interviewCompleted, setInterviewCompleted] = useState(false);
    const [finalReport, setFinalReport] = useState<any>(null);
    const [waitingForResponse, setWaitingForResponse] = useState(false); // Track if waiting for user response

    useEffect(() => {
        if (domain && !interviewStarted) {
            startInterview();
        }
    }, [domain]);

    // Cleanup effect for speech recognition and speech synthesis
    useEffect(() => {
        return () => {
            if (recognition) {
                recognition.stop();
            }
            // Stop any ongoing speech synthesis
            stopSpeechSynthesis();
        };
    }, [recognition]);

    // Stop speech when interview is completed
    useEffect(() => {
        if (interviewCompleted) {
            stopSpeechSynthesis();
        }
    }, [interviewCompleted]);

    // Timer effect
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (interviewStarted && !interviewCompleted && timeRemaining > 0) {
            interval = setInterval(() => {
                setTimeRemaining((prev) => {
                    if (prev <= 1) {
                        endInterview();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [interviewStarted, interviewCompleted, timeRemaining]);

    // Talking Avatar Configuration
    const avatarConfig = {
        apiKey: process.env.NEXT_PUBLIC_DID_API_KEY || '',
        sourceUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face', // Default avatar image
        voiceId: 'en-US-AriaNeural',
        language: 'en'
    };
    
    const { speakText: speakWithAvatar, isGenerating: isAvatarGenerating, videoUrl } = useTalkingAvatar(avatarConfig);

    // Safe function to stop speech synthesis
    const stopSpeechSynthesis = () => {
        if ('speechSynthesis' in window) {
            try {
                speechSynthesis.cancel();
                setIsSpeaking(false);
                setIsAISpeaking(false);
                console.log('🔇 Speech synthesis stopped safely');
            } catch (error) {
                console.warn('⚠️ Error stopping speech synthesis:', error);
            }
        }
    };

    // Enhanced text-to-speech function with proper fallback
    const speakText = async (text: string) => {
        console.log('🎤 Speaking text:', text);
        
        // Always try regular TTS first for immediate response
        if ('speechSynthesis' in window) {
            // Stop any current speech and wait a moment
            stopSpeechSynthesis();
            
            // Wait for speech synthesis to be ready
            await new Promise(resolve => setTimeout(resolve, 100));
            
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.9;
            utterance.pitch = 1;
            utterance.volume = 0.8;
            utterance.lang = 'en-US';
            
            utterance.onstart = () => {
                console.log('🔊 Speech started');
                setIsSpeaking(true);
                setIsAISpeaking(true);
            };
            
            utterance.onend = () => {
                console.log('🔇 Speech ended');
                setIsSpeaking(false);
                setIsAISpeaking(false);
            };
            
            utterance.onerror = (event) => {
                console.warn('⚠️ Speech error (this is usually harmless):', event.error);
                // Don't log as error for common interruptions
                if (event.error !== 'interrupted' && event.error !== 'canceled') {
                    console.error('❌ Speech error:', event.error);
                }
                setIsSpeaking(false);
                setIsAISpeaking(false);
            };
            
            utterance.onpause = () => {
                console.log('⏸️ Speech paused');
            };
            
            utterance.onresume = () => {
                console.log('▶️ Speech resumed');
            };
            
            try {
                // Check if speech synthesis is speaking before starting new speech
                if (speechSynthesis.speaking) {
                    console.log('🔄 Speech already in progress, cancelling previous speech');
                    speechSynthesis.cancel();
                    await new Promise(resolve => setTimeout(resolve, 200));
                }
                
                speechSynthesis.speak(utterance);
                console.log('✅ Speech synthesis started successfully');
            } catch (error) {
                console.error('❌ Failed to start speech synthesis:', error);
                setIsSpeaking(false);
                setIsAISpeaking(false);
            }
        } else {
            console.warn('⚠️ Speech synthesis not supported in this browser');
        }
        
        // Optionally try talking avatar in parallel (non-blocking)
        if (avatarConfig.apiKey) {
            try {
                await speakWithAvatar(text);
            } catch (error) {
                console.log('Talking avatar failed, using regular TTS:', error);
            }
        }
    };

    // Speech-to-text function
    const startRecording = () => {
        // Check if speech recognition is supported
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
            return;
        }

        // Check for microphone permission
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then(() => {
                    // Permission granted, start speech recognition
                    performSpeechRecognition();
                })
                .catch((error) => {
                    console.error('Microphone permission denied:', error);
                    alert('Microphone permission is required for voice recording. Please allow microphone access and try again.');
                });
        } else {
            // Fallback for older browsers
            performSpeechRecognition();
        }
    };

    const performSpeechRecognition = () => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognitionInstance = new SpeechRecognition();
        
        recognitionInstance.continuous = true; // Allow continuous recording
        recognitionInstance.interimResults = true; // Enable interim results for better UX
        recognitionInstance.lang = 'en-US';
        recognitionInstance.maxAlternatives = 1;
        
        recognitionInstance.onstart = () => {
            console.log('Speech recognition started');
            setIsRecording(true);
        };
        
        recognitionInstance.onresult = (event: any) => {
            console.log('Speech recognition result:', event);
            let finalTranscript = '';
            let interimTranscript = '';
            
            // Process all results
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }
            
            // Update the response with interim results for real-time feedback
            if (interimTranscript) {
                setUserResponse(prev => {
                    // Remove any previous interim text and add new interim text
                    const cleanPrev = prev.replace(/\[.*?\]/g, '');
                    return cleanPrev + `[${interimTranscript}]`;
                });
            }
            
            // If we have a final result, use it
            if (finalTranscript) {
                setUserResponse(prev => {
                    // Remove any interim text and add final text
                    const cleanPrev = prev.replace(/\[.*?\]/g, '');
                    return cleanPrev + finalTranscript;
                });
                // Don't auto-stop recording - let user control it
            }
        };
        
        recognitionInstance.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            setIsRecording(false);
            
            let errorMessage = 'Speech recognition failed. ';
            switch (event.error) {
                case 'no-speech':
                    errorMessage += 'No speech was detected. Please try again.';
                    break;
                case 'audio-capture':
                    errorMessage += 'No microphone was found. Please check your microphone.';
                    break;
                case 'not-allowed':
                    errorMessage += 'Microphone permission was denied. Please allow microphone access.';
                    break;
                case 'network':
                    errorMessage += 'Network error occurred. Please check your internet connection.';
                    break;
                default:
                    errorMessage += `Error: ${event.error}. Please try again.`;
            }
            alert(errorMessage);
        };
        
        recognitionInstance.onend = () => {
            console.log('Speech recognition ended');
            setIsRecording(false);
        };
        
        // Store the recognition instance for potential stopping
        setRecognition(recognitionInstance);
        
        try {
            recognitionInstance.start();
        } catch (error) {
            console.error('Failed to start speech recognition:', error);
            setIsRecording(false);
            alert('Failed to start speech recognition. Please try again.');
        }
    };

    const stopRecording = () => {
        if (recognition) {
            recognition.stop();
            setRecognition(null);
        }
        setIsRecording(false);
    };

    // Advanced Falcon AI Judging function with prompt engineering
    const getFalconJudging = async (question: string, response: string) => {
        try {
            const judgingResponse = await fetch('/api/falcon-interview-judge', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    question,
                    candidateResponse: response,
                    domain,
                    interviewType,
                    previousContext: conversationHistory.length > 0 ? 
                        conversationHistory[conversationHistory.length - 1].user_response : undefined,
                    conversationHistory: conversationHistory.slice(-3) // Last 3 exchanges for context
                }),
            });

            if (judgingResponse.ok) {
                const judgingData = await judgingResponse.json();
                console.log("✅ Advanced Falcon judging completed:", judgingData);
                return judgingData;
            } else {
                console.error("Falcon judging failed");
                return null;
            }
        } catch (error) {
            console.error("Error getting Falcon judging:", error);
            return null;
        }
    };

    const endInterview = async () => {
        console.log('🛑 Ending interview...');
        
        // Stop any ongoing speech synthesis
        stopSpeechSynthesis();
        
        // Stop any ongoing recording
        if (recognition) {
            recognition.stop();
            setRecognition(null);
            setIsRecording(false);
            console.log('🎤 Recording stopped');
        }
        
        // Set states
        setIsSpeaking(false);
        setIsAISpeaking(false);
        setInterviewCompleted(true);
        
        // Generate final report
        await generateFinalReport();
    };

    const startInterview = async () => {
        if (!user?.emailAddresses?.[0]?.emailAddress) {
            alert('User email not found');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/ai-interview-agent-simple', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    domain: domain,
                    interviewId: interviewId,
                    userEmail: user.emailAddresses[0].emailAddress,
                    interviewType: interviewType,
                    isFeedback: false,
                    conversationMode: true, // Enable conversational mode
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setInterviewData(data);
                setInterviewStarted(true);
                setWaitingForResponse(true);
                // Speak the AI's opening message
                if (data.ai_message) {
                    console.log('🎤 AI message received:', data.ai_message);
                    speakText(data.ai_message);
                } else {
                    console.warn('⚠️ No AI message received');
                }
            } else {
                console.error('Failed to start interview');
                alert('Failed to start interview. Please try again.');
            }
        } catch (error) {
            console.error('Error starting interview:', error);
            alert('Error starting interview. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const submitResponse = async () => {
        if (!userResponse.trim() && !codeResponse.trim()) {
            alert('Please provide a response before submitting');
            return;
        }

        if (!user?.emailAddresses?.[0]?.emailAddress) {
            alert('User email not found');
            return;
        }

        // Update conversation history
        const newConversationEntry = {
            ai_message: interviewData?.ai_message || '',
            user_response: interviewType === 'dsa' ? codeResponse : userResponse,
            timestamp: new Date().toISOString()
        };
        setConversationHistory(prev => [...prev, newConversationEntry]);

        setLoading(true);
        setWaitingForResponse(false);
        
        try {
            // Get conversational response from AI
            const response = await fetch('/api/ai-interview-agent-simple', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userInput: interviewType === 'dsa' ? codeResponse : userResponse,
                    domain: domain,
                    interviewId: interviewId,
                    userEmail: user.emailAddresses[0].emailAddress,
                    interviewType: interviewType,
                    isFeedback: false,
                    conversationMode: true,
                    conversationHistory: conversationHistory.slice(-5), // Last 5 exchanges for context
                    codeLanguage: selectedLanguage,
                    dsaQuestion: interviewData?.dsa_question
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setInterviewData(data);
                setUserResponse('');
                setCodeResponse('');
                setWaitingForResponse(true);
                
                // Speak the AI's response
                if (data.ai_message) {
                    console.log('🎤 AI response received:', data.ai_message);
                    speakText(data.ai_message);
                } else {
                    console.warn('⚠️ No AI response received');
                }
            } else {
                console.error('Failed to submit response');
                alert('Failed to submit response. Please try again.');
            }
        } catch (error) {
            console.error('Error submitting response:', error);
            alert('Error submitting response. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const generateFinalReport = async () => {
        if (!user?.emailAddresses?.[0]?.emailAddress) {
            return;
        }

        setLoading(true);
        try {
            // Combine all conversation for final analysis
            const allConversations = conversationHistory.map((c: any) => `AI: ${c.ai_message}\nCandidate: ${c.user_response}`).join('\n\n');
            
            const response = await fetch('/api/ai-interview-agent-simple', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userInput: allConversations,
                    domain: domain,
                    interviewId: interviewId,
                    userEmail: user.emailAddresses[0].emailAddress,
                    interviewType: interviewType,
                    isFeedback: true, // Generate final feedback
                    conversationMode: true,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setFinalReport(data);
                setShowFeedback(true);
                
                // Save PDF and interview data to database
                await saveInterviewData(data);
            } else {
                console.error('Failed to generate final report');
            }
        } catch (error) {
            console.error('Error generating final report:', error);
        } finally {
            setLoading(false);
        }
    };
    
    const saveInterviewData = async (reportData: any) => {
        try {
            const interviewData = {
                interviewType,
                duration,
                domain,
                conversationHistory,
                finalScore: reportData.feedback?.overall_score,
                codeAnalysis: reportData.feedback?.code_analysis,
                avatarVideoUrl: null, // Will be set when avatar video is generated
                avatarVideoId: null
            };
            
            await fetch('/api/pdf-reports', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    recordId: interviewId,
                    pdfData: reportData,
                    interviewData
                }),
            });
            
            console.log('Interview data saved successfully');
        } catch (error) {
            console.error('Error saving interview data:', error);
        }
    };

    const downloadReport = async () => {
        if (!finalReport) {
            alert('No report data available. Please complete the interview first.');
            return;
        }

        try {
            console.log('📄 Starting PDF generation...');
            
            const reportData: InterviewReportData = {
                interviewDetails: {
                    domain: domain,
                    duration: duration,
                    date: new Date().toISOString(),
                    conversationTurns: conversationHistory.length,
                    interviewType: interviewType
                },
                conversationHistory: conversationHistory,
                feedback: finalReport.feedback || {
                    overall_score: 0,
                    strengths: [],
                    areas_for_improvement: [],
                    detailed_analysis: 'No detailed analysis available.',
                    recommendations: [],
                    next_steps: 'No next steps available.'
                }
            };

            console.log('📊 Report data prepared:', reportData);
            
            const pdfBlob = await generateInterviewPDF(reportData);
            const filename = `interview-report-${domain.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
            
            console.log('📥 Downloading PDF:', filename);
            downloadPDF(pdfBlob, filename);
            
        } catch (error) {
            console.error('❌ Error generating PDF:', error);
            alert('Failed to generate PDF report. Please try again or contact support if the issue persists.');
        }
    };

    const progressPercentage = timeRemaining > 0 ? ((duration * 60 - timeRemaining) / (duration * 60)) * 100 : 100;

    if (loading && !interviewStarted) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Starting your interview...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link href="/ai-tools">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to AI Tools
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">AI Voice Interview</h1>
                            <p className="text-gray-600">
                                Domain: {domain} | Type: {interviewType === 'technical' ? 'Technical' : 'Culture Fit'} | Duration: {duration} minutes
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        {interviewData && (
                            <Badge variant="outline">
                                Conversation Turn {interviewData.conversation_count || conversationHistory.length + 1}
                            </Badge>
                        )}
                        <div className="flex items-center gap-2 text-lg font-semibold">
                            <Clock className="h-5 w-5" />
                            {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Interview Progress</span>
                        <span>{Math.round(progressPercentage)}%</span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                </div>

                {/* Interview Content */}
                {interviewData && (
                    <div className="max-w-4xl mx-auto">
                        {!showFeedback && !interviewCompleted ? (
                            // Question Phase
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Volume2 className="h-5 w-5" />
                                        AI Voice Interview
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* AI Avatar Section with Video Support */}
                                    <div className="flex items-center justify-center mb-6">
                                        <div className="relative">
                                            {/* AI Avatar */}
                                            <div className={`w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold transition-all duration-300 ${
                                                isAISpeaking ? 'animate-pulse scale-105' : ''
                                            }`} id="ai-avatar">
                                                AI
                                            </div>
                                            
                                            {/* Talking Avatar Video Overlay */}
                                            {videoUrl && (
                                                <div className="absolute inset-0 w-32 h-32 rounded-full overflow-hidden">
                                                    <video 
                                                        src={videoUrl} 
                                                        autoPlay 
                                                        loop 
                                                        muted
                                                        className="w-full h-full object-cover rounded-full"
                                                    />
                                                </div>
                                            )}
                                            
                                            {/* Speaking indicator */}
                                            {isAISpeaking && (
                                                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                                    <div className="w-3 h-3 bg-white rounded-full animate-ping"></div>
                                                </div>
                                            )}
                                            
                                            {/* Avatar generation indicator */}
                                            {isAvatarGenerating && (
                                                <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* AI Message Display */}
                                    <div className="bg-blue-50 p-6 rounded-lg">
                                        {/* AI Response */}
                                        {interviewData.ai_message && (
                                            <div className="bg-white p-4 rounded-lg mb-4 border-l-4 border-blue-500">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                                    <span className="text-sm font-medium text-blue-700">AI Interviewer:</span>
                                                </div>
                                                <p className="text-gray-700 italic">"{interviewData.ai_message}"</p>
                                            </div>
                                        )}

                                    {/* DSA Question Display */}
                                    {interviewData.dsa_question && (
                                        <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg mb-4 border-l-4 border-purple-500">
                                            <div className="flex items-center gap-2 mb-4">
                                                <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                                                <span className="text-sm font-medium text-purple-700">DSA Problem</span>
                                                <span className={`text-xs px-2 py-1 rounded-full ${
                                                    interviewData.dsa_question.difficulty === 'easy' ? 'bg-green-200 text-green-800' :
                                                    interviewData.dsa_question.difficulty === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                                                    'bg-red-200 text-red-800'
                                                }`}>
                                                    {interviewData.dsa_question.difficulty.toUpperCase()}
                                                </span>
                                            </div>
                                            
                                            <h4 className="font-semibold text-gray-800 mb-3">{interviewData.dsa_question.title}</h4>
                                            <p className="text-gray-700 leading-relaxed mb-4">{interviewData.dsa_question.description}</p>
                                            
                                            {/* Examples */}
                                            {interviewData.dsa_question.examples && interviewData.dsa_question.examples.length > 0 && (
                                                <div className="mb-4">
                                                    <h5 className="font-semibold text-gray-800 mb-2">Examples:</h5>
                                                    <div className="space-y-2">
                                                        {interviewData.dsa_question.examples.map((example: string, index: number) => (
                                                            <div key={index} className="bg-white p-3 rounded border text-sm">
                                                                <pre className="whitespace-pre-wrap">{example}</pre>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {/* Constraints */}
                                            {interviewData.dsa_question.constraints && interviewData.dsa_question.constraints.length > 0 && (
                                                <div className="mb-4">
                                                    <h5 className="font-semibold text-gray-800 mb-2">Constraints:</h5>
                                                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                                                        {interviewData.dsa_question.constraints.map((constraint: string, index: number) => (
                                                            <li key={index}>{constraint}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            
                                            {/* Test Cases */}
                                            {interviewData.dsa_question.test_cases && interviewData.dsa_question.test_cases.length > 0 && (
                                                <div>
                                                    <h5 className="font-semibold text-gray-800 mb-2">Test Cases:</h5>
                                                    <div className="space-y-2">
                                                        {interviewData.dsa_question.test_cases.map((testCase: any, index: number) => (
                                                            <div key={index} className="bg-white p-3 rounded border text-sm">
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div>
                                                                        <strong>Input:</strong>
                                                                        <pre className="whitespace-pre-wrap mt-1">{testCase.input}</pre>
                                                                    </div>
                                                                    <div>
                                                                        <strong>Output:</strong>
                                                                        <pre className="whitespace-pre-wrap mt-1">{testCase.output}</pre>
                                                                    </div>
                                                                </div>
                                                                {testCase.explanation && (
                                                                    <div className="mt-2 text-gray-600">
                                                                        <strong>Explanation:</strong> {testCase.explanation}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    const textToSpeak = interviewData.ai_message || '';
                                                    speakText(textToSpeak);
                                                }}
                                                disabled={isSpeaking || !interviewData.ai_message}
                                            >
                                                {isSpeaking ? <VolumeX className="h-4 w-4 mr-2" /> : <Volume2 className="h-4 w-4 mr-2" />}
                                                {isSpeaking ? 'Speaking...' : 'Listen to AI Response'}
                                            </Button>
                                            
                                            {/* Test TTS Button */}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    speakText('Hello! This is a test of the text-to-speech functionality. Can you hear me clearly?');
                                                }}
                                                disabled={isSpeaking}
                                                className="bg-green-100 hover:bg-green-200"
                                            >
                                                🔊 Test Voice
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Response Section */}
                                    {interviewType === 'dsa' ? (
                                        // DSA Code Editor
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <label htmlFor="code-response" className="block text-sm font-medium">
                                                    Your Code Solution:
                                                </label>
                                                <select
                                                    value={selectedLanguage}
                                                    onChange={(e) => setSelectedLanguage(e.target.value)}
                                                    className="px-3 py-1 border rounded text-sm"
                                                >
                                                    <option value="javascript">JavaScript</option>
                                                    <option value="python">Python</option>
                                                    <option value="java">Java</option>
                                                    <option value="cpp">C++</option>
                                                    <option value="c">C</option>
                                                </select>
                                            </div>
                                            <textarea
                                                id="code-response"
                                                value={codeResponse}
                                                onChange={(e) => setCodeResponse(e.target.value)}
                                                placeholder={`// Write your ${selectedLanguage} solution here\n// Include time and space complexity analysis\n\nfunction solution() {\n    // Your code here\n}`}
                                                className="w-full h-64 p-4 border rounded-lg font-mono text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                                style={{ fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace' }}
                                            />
                                            <div className="text-xs text-gray-500">
                                                💡 Tip: Include comments explaining your approach, time complexity, and space complexity
                                            </div>
                                        </div>
                                    ) : (
                                        // Regular Response
                                        <div className="space-y-4">
                                            <label htmlFor="response" className="block text-sm font-medium">
                                                Your Response:
                                                {isRecording && (
                                                    <span className="ml-2 text-red-600 text-xs font-normal">
                                                        🎤 Recording... Speak now
                                                    </span>
                                                )}
                                            </label>
                                            <div className="flex gap-2">
                                                <textarea
                                                    id="response"
                                                    value={userResponse}
                                                    onChange={(e) => setUserResponse(e.target.value)}
                                                    placeholder={isRecording ? "Listening... Speak your response..." : "Your response will appear here after speaking or type manually..."}
                                                    className={`flex-1 h-32 p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                                        isRecording 
                                                            ? 'border-red-300 bg-red-50 animate-pulse' 
                                                            : userResponse 
                                                                ? 'border-green-300 bg-green-50' 
                                                                : 'border-gray-300'
                                                    }`}
                                                    disabled={false}
                                                />
                                            </div>
                                            <div className="text-xs text-gray-500 space-y-1">
                                                {isRecording && (
                                                    <div className="text-red-600 font-medium">
                                                        🎤 Recording in progress... Speak clearly into your microphone
                                                    </div>
                                                )}
                                                {userResponse && (
                                                    <div className="flex items-center gap-2">
                                                        <span>✓ Response captured ({userResponse.length} characters)</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => setUserResponse('')}
                                                            className="text-red-500 hover:text-red-700 underline"
                                                        >
                                                            Clear
                                                        </button>
                                                    </div>
                                                )}
                                                {!isRecording && !userResponse && (
                                                    <div>
                                                        💡 Tip: Click "Start Speaking" to record your voice, or type your response manually. This is a conversational interview - feel free to ask questions or elaborate on your answers.
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                                                            <div className="flex justify-between items-center">
                                        <div className="flex flex-col gap-2">
                                            <Button
                                                variant={isRecording ? "destructive" : "outline"}
                                                onClick={isRecording ? stopRecording : startRecording}
                                                disabled={loading}
                                                className={`flex items-center gap-2 ${isRecording ? 'animate-pulse' : ''}`}
                                            >
                                                {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                                                {isRecording ? 'Stop Recording' : 'Start Speaking'}
                                            </Button>
                                            {isRecording && (
                                                <p className="text-xs text-red-600 text-center">
                                                    🎤 Recording... Click "Stop Recording" when finished
                                                </p>
                                            )}
                                        </div>
                                        
                                        <div className="flex gap-3">
                                            <Button
                                                variant="outline"
                                                onClick={endInterview}
                                                disabled={loading}
                                            >
                                                End Interview
                                            </Button>
                                            <Button
                                                onClick={submitResponse}
                                                disabled={loading || (!userResponse.trim() && !codeResponse.trim())}
                                            >
                                                {loading ? 'Submitting...' : 'Submit Response'}
                                                <Send className="h-4 w-4 ml-2" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            // Feedback Phase
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                        Interview Feedback
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Overall Score */}
                                    <div className="text-center">
                                        <div className="text-4xl font-bold text-blue-600 mb-2">
                                            {finalReport?.feedback?.overall_score || interviewData.feedback?.overall_score}/100
                                        </div>
                                        <p className="text-gray-600">Overall Performance Score</p>
                                    </div>

                                    <Separator />

                                    {/* Detailed Analysis */}
                                    <div>
                                        <h3 className="text-lg font-semibold mb-3">Detailed Analysis</h3>
                                        <p className="text-gray-700 leading-relaxed">
                                            {finalReport?.feedback?.detailed_analysis || interviewData.feedback?.detailed_analysis}
                                        </p>
                                    </div>

                                    {/* Strengths */}
                                    <div>
                                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                            <CheckCircle className="h-5 w-5 text-green-600" />
                                            Strengths
                                        </h3>
                                        <ul className="space-y-2">
                                            {(finalReport?.feedback?.strengths || interviewData.feedback?.strengths || []).map((strength: string, index: number) => (
                                                <li key={index} className="flex items-start gap-2">
                                                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                    <span className="text-gray-700">{strength}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Areas for Improvement */}
                                    <div>
                                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                            <AlertCircle className="h-5 w-5 text-orange-600" />
                                            Areas for Improvement
                                        </h3>
                                        <ul className="space-y-2">
                                            {(finalReport?.feedback?.areas_for_improvement || interviewData.feedback?.areas_for_improvement || []).map((area: string, index: number) => (
                                                <li key={index} className="flex items-start gap-2">
                                                    <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                                                    <span className="text-gray-700">{area}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Code Analysis (for DSA interviews) */}
                                    {interviewType === 'dsa' && (finalReport?.feedback?.code_analysis || interviewData.feedback?.code_analysis) && (
                                        <div>
                                            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                                <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                                                    <span className="text-white text-xs font-bold">💻</span>
                                                </div>
                                                Code Analysis
                                            </h3>
                                            <div className="grid md:grid-cols-2 gap-6">
                                                <div className="space-y-4">
                                                    <div className="bg-white p-4 rounded-lg border">
                                                        <h4 className="font-semibold text-gray-800 mb-2">Correctness</h4>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                                <div 
                                                                    className="bg-green-500 h-2 rounded-full" 
                                                                    style={{ width: `${(finalReport?.feedback?.code_analysis || interviewData.feedback?.code_analysis)?.correctness || 0}%` }}
                                                                ></div>
                                                            </div>
                                                            <span className="text-sm font-medium">
                                                                {(finalReport?.feedback?.code_analysis || interviewData.feedback?.code_analysis)?.correctness || 0}/100
                                                            </span>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="bg-white p-4 rounded-lg border">
                                                        <h4 className="font-semibold text-gray-800 mb-2">Efficiency</h4>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                                <div 
                                                                    className="bg-blue-500 h-2 rounded-full" 
                                                                    style={{ width: `${(finalReport?.feedback?.code_analysis || interviewData.feedback?.code_analysis)?.efficiency || 0}%` }}
                                                                ></div>
                                                            </div>
                                                            <span className="text-sm font-medium">
                                                                {(finalReport?.feedback?.code_analysis || interviewData.feedback?.code_analysis)?.efficiency || 0}/100
                                                            </span>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="bg-white p-4 rounded-lg border">
                                                        <h4 className="font-semibold text-gray-800 mb-2">Readability</h4>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                                <div 
                                                                    className="bg-purple-500 h-2 rounded-full" 
                                                                    style={{ width: `${(finalReport?.feedback?.code_analysis || interviewData.feedback?.code_analysis)?.readability || 0}%` }}
                                                                ></div>
                                                            </div>
                                                            <span className="text-sm font-medium">
                                                                {(finalReport?.feedback?.code_analysis || interviewData.feedback?.code_analysis)?.readability || 0}/100
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="space-y-4">
                                                    <div className="bg-white p-4 rounded-lg border">
                                                        <h4 className="font-semibold text-gray-800 mb-2">Time Complexity</h4>
                                                        <p className="text-gray-700 font-mono">
                                                            {(finalReport?.feedback?.code_analysis || interviewData.feedback?.code_analysis)?.time_complexity || 'N/A'}
                                                        </p>
                                                    </div>
                                                    
                                                    <div className="bg-white p-4 rounded-lg border">
                                                        <h4 className="font-semibold text-gray-800 mb-2">Space Complexity</h4>
                                                        <p className="text-gray-700 font-mono">
                                                            {(finalReport?.feedback?.code_analysis || interviewData.feedback?.code_analysis)?.space_complexity || 'N/A'}
                                                        </p>
                                                    </div>
                                                    
                                                    {(finalReport?.feedback?.code_analysis || interviewData.feedback?.code_analysis)?.suggestions && (
                                                        <div className="bg-white p-4 rounded-lg border">
                                                            <h4 className="font-semibold text-gray-800 mb-2">Code Suggestions</h4>
                                                            <ul className="space-y-1">
                                                                {(finalReport?.feedback?.code_analysis || interviewData.feedback?.code_analysis)?.suggestions.map((suggestion: string, index: number) => (
                                                                    <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                                                                        <span className="text-blue-500">•</span>
                                                                        {suggestion}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Next Steps */}
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h3 className="text-lg font-semibold mb-2">Next Steps</h3>
                                        <p className="text-gray-700">
                                            {finalReport?.feedback?.next_steps || interviewData.feedback?.next_steps}
                                        </p>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex justify-between">
                                        <Button
                                            variant="outline"
                                            onClick={() => window.location.href = '/ai-tools'}
                                        >
                                            Back to AI Tools
                                        </Button>
                                        <div className="flex gap-3">
                                            <Button
                                                variant="outline"
                                                onClick={downloadReport}
                                                disabled={!finalReport}
                                            >
                                                <Download className="h-4 w-4 mr-2" />
                                                Download PDF Report
                                            </Button>
                                            <Button onClick={() => window.location.href = '/ai-tools'}>
                                                Complete Interview
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}

                {loading && interviewStarted && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">
                                {showFeedback ? 'Analyzing your response...' : 'Getting next question...'}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InterviewPage;
