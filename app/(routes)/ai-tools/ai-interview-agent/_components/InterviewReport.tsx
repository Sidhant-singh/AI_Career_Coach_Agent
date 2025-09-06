"use client";
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, AlertCircle, TrendingUp, Target, Lightbulb, ArrowRight } from 'lucide-react';

interface InterviewFeedback {
    overall_score: number;
    strengths: string[];
    areas_for_improvement: string[];
    detailed_analysis: string;
    recommendations: string[];
    next_steps: string;
}

interface InterviewReportProps {
    feedback: InterviewFeedback;
    domain: string;
    questionNumber: number;
    totalQuestions: number;
}

const InterviewReport: React.FC<InterviewReportProps> = ({ 
    feedback, 
    domain, 
    questionNumber, 
    totalQuestions 
}) => {
    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getScoreBadgeVariant = (score: number) => {
        if (score >= 80) return 'default';
        if (score >= 60) return 'secondary';
        return 'destructive';
    };

    const getScoreLabel = (score: number) => {
        if (score >= 90) return 'Excellent';
        if (score >= 80) return 'Very Good';
        if (score >= 70) return 'Good';
        if (score >= 60) return 'Fair';
        return 'Needs Improvement';
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="text-center">
                <h1 className="text-3xl font-bold mb-2">Interview Feedback Report</h1>
                <p className="text-gray-600 mb-4">Domain: {domain}</p>
                <Badge variant="outline" className="text-sm">
                    Question {questionNumber} of {totalQuestions}
                </Badge>
            </div>

            {/* Overall Score */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Overall Performance Score
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center space-y-4">
                        <div className={`text-6xl font-bold ${getScoreColor(feedback.overall_score)}`}>
                            {feedback.overall_score}
                        </div>
                        <div className="text-2xl text-gray-600">/ 100</div>
                        <Badge variant={getScoreBadgeVariant(feedback.overall_score)} className="text-lg px-4 py-2">
                            {getScoreLabel(feedback.overall_score)}
                        </Badge>
                        <div className="w-full max-w-md mx-auto">
                            <Progress value={feedback.overall_score} className="h-3" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Detailed Analysis */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Detailed Analysis
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="bg-gray-50 p-6 rounded-lg">
                        <p className="text-gray-700 leading-relaxed text-lg">
                            {feedback.detailed_analysis}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Strengths and Areas for Improvement */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Strengths */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-700">
                            <CheckCircle className="h-5 w-5" />
                            Strengths
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3">
                            {feedback.strengths.map((strength, index) => (
                                <li key={index} className="flex items-start gap-3">
                                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                    <span className="text-gray-700">{strength}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>

                {/* Areas for Improvement */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-orange-700">
                            <AlertCircle className="h-5 w-5" />
                            Areas for Improvement
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3">
                            {feedback.areas_for_improvement.map((area, index) => (
                                <li key={index} className="flex items-start gap-3">
                                    <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                                    <span className="text-gray-700">{area}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>

            {/* Recommendations */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="h-5 w-5" />
                        Recommendations
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {feedback.recommendations.map((recommendation, index) => (
                            <div key={index} className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                                    {index + 1}
                                </div>
                                <span className="text-gray-700">{recommendation}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Next Steps */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ArrowRight className="h-5 w-5" />
                        Next Steps
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border-l-4 border-blue-500">
                        <p className="text-gray-700 leading-relaxed text-lg">
                            {feedback.next_steps}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Action Items Summary */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Action Items</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <h4 className="font-semibold text-green-700 mb-2">Keep Doing:</h4>
                            <ul className="space-y-1">
                                {feedback.strengths.slice(0, 2).map((strength, index) => (
                                    <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                                        <CheckCircle className="h-3 w-3 text-green-500" />
                                        {strength}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-orange-700 mb-2">Focus On:</h4>
                            <ul className="space-y-1">
                                {feedback.areas_for_improvement.slice(0, 2).map((area, index) => (
                                    <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                                        <AlertCircle className="h-3 w-3 text-orange-500" />
                                        {area}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default InterviewReport;

