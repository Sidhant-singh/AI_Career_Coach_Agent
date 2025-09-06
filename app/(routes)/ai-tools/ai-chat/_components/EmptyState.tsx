import React from 'react'
const questionsList = [
    'I want to transition from marketing to tech. Where should I start?',
    'I have 3 years of experience as a developer. What should be my next career move?',
    'I feel stuck in my current role. Can you help me explore new opportunities?',
    'What skills should I focus on to advance in product management?',
    'I want to negotiate a higher salary. What\'s the best approach?',
    'I\'m considering starting my own business. What should I know?',
]

function EmptyState({selectedQuestion} : any) {
    return (
        <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
                <h2 className='font-bold text-2xl mb-2'>Start a Conversation with Your AI Career Coach</h2>
                <p className="text-gray-600">Choose a topic below or start typing your own question. I'm here to have a natural conversation about your career goals!</p>
            </div>
            <div className="space-y-3">
                {questionsList.map((question, index) => (
                    <div 
                        className='p-4 text-left border rounded-lg hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-all duration-200'
                        key = {index}
                        onClick = {() => selectedQuestion(question)}
                    >
                        <p className="text-gray-700">{question}</p>
                    </div>    
                ))}
            </div>
            <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">💡 Tip: Feel free to ask follow-up questions and have a back-and-forth conversation!</p>
            </div>
        </div>
    )
}

export default EmptyState