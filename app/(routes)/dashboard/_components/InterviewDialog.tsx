"use client";
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';

interface InterviewDialogProps {
    openDialog: boolean;
    setOpenDialog: (open: boolean) => void;
}

const InterviewDialog: React.FC<InterviewDialogProps> = ({ openDialog, setOpenDialog }) => {
    const [domain, setDomain] = useState('');
    const [interviewType, setInterviewType] = useState<'technical' | 'culture-fit' | 'dsa'>('technical');
    const [interviewDuration, setInterviewDuration] = useState(10); // Default 10 minutes
    const [loading, setLoading] = useState(false);
    const { user } = useUser();
    const router = useRouter();

    const handleStartInterview = async () => {
        if (!domain.trim()) {
            alert('Please enter a domain/role for the interview');
            return;
        }

        if (!user?.emailAddresses?.[0]?.emailAddress) {
            alert('User email not found');
            return;
        }

        setLoading(true);
        const interviewId = uuidv4();

        try {
            // Create a new history entry for the interview
            const result = await fetch('/api/history', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    recordId: interviewId,
                    content: [],
                    aiAgentType: '/ai-tools/ai-interview-agent'
                }),
            });

            if (result.ok) {
                console.log('Interview history created');
                setOpenDialog(false);
                router.push(`/ai-tools/ai-interview-agent/${interviewId}?domain=${encodeURIComponent(domain)}&duration=${interviewDuration}&type=${interviewType}`);
            } else {
                console.error('Failed to create interview history');
                alert('Failed to start interview. Please try again.');
            }
        } catch (error) {
            console.error('Error starting interview:', error);
            alert('Error starting interview. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Start AI Mock Interview</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="domain" className="text-right">
                            Domain/Role
                        </label>
                        <Input
                            id="domain"
                            placeholder="e.g., Software Engineer, Data Scientist, Product Manager"
                            value={domain}
                            onChange={(e) => setDomain(e.target.value)}
                            className="col-span-3"
                        />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <label className="text-right">
                            Interview Type
                        </label>
                        <div className="col-span-3 grid grid-cols-1 gap-2">
                            <button
                                type="button"
                                onClick={() => setInterviewType('technical')}
                                className={`px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${
                                    interviewType === 'technical'
                                        ? 'bg-blue-500 text-white border-blue-500'
                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                <div className="text-center">
                                    <div className="font-semibold">Technical</div>
                                    <div className="text-xs opacity-90">Coding, algorithms, system design</div>
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={() => setInterviewType('culture-fit')}
                                className={`px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${
                                    interviewType === 'culture-fit'
                                        ? 'bg-green-500 text-white border-green-500'
                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                <div className="text-center">
                                    <div className="font-semibold">Culture Fit</div>
                                    <div className="text-xs opacity-90">Behavioral, HR, soft skills</div>
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={() => setInterviewType('dsa')}
                                className={`px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${
                                    interviewType === 'dsa'
                                        ? 'bg-purple-500 text-white border-purple-500'
                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                <div className="text-center">
                                    <div className="font-semibold">DSA</div>
                                    <div className="text-xs opacity-90">Data structures & algorithms</div>
                                </div>
                            </button>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                        <label className="text-right">
                            Duration
                        </label>
                        <div className="col-span-3 flex gap-2 flex-wrap">
                            {[2, 5, 10, 15, 30].map((minutes) => (
                                <button
                                    key={minutes}
                                    type="button"
                                    onClick={() => setInterviewDuration(minutes)}
                                    className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors whitespace-nowrap ${
                                        interviewDuration === minutes
                                            ? 'bg-blue-500 text-white border-blue-500'
                                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    {minutes} min
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                        <strong>Technical Interview:</strong> Focus on coding challenges, algorithms, system design, and technical problem-solving.<br/>
                        <strong>Culture Fit Interview:</strong> Focus on behavioral questions, teamwork, leadership, and company culture alignment.<br/>
                        <strong>DSA Interview:</strong> Focus on data structures, algorithms, LeetCode-style problems with code solutions and complexity analysis.<br/>
                        The AI will conduct a dynamic voice-based mock interview with realistic responses and real-time judging.
                    </div>
                </div>
                <div className="flex justify-end gap-2">
                    <Button 
                        variant="outline" 
                        onClick={() => setOpenDialog(false)}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleStartInterview}
                        disabled={loading || !domain.trim()}
                    >
                        {loading ? 'Starting...' : 'Start Interview'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default InterviewDialog;
