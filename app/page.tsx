"use client"
import React from 'react';
import { MessageCircle, FileText, Map, Users, Brain, Target, TrendingUp, Star } from 'lucide-react';
import { SignIn, SignInButton, UserButton, useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LearnMateHomepage() {
  const { user, isSignedIn } = useUser();
  const router = useRouter();

  // Handle protected route navigation
  const handleProtectedNavigation = (route: string) => {
    if (!isSignedIn) {
      // Show sign-in modal or redirect to sign-in
      return;
    }
    router.push(route);
  };

  // Handle Get Started button click
  const handleGetStarted = () => {
    if (isSignedIn) {
      router.push('/dashboard');
    }
    // If not signed in, the SignInButton will handle the modal
  };

  const features = [
    {
      icon: <MessageCircle className="w-8 h-8 text-blue-600" />,
      title: "Q&A Chatbot",
      description: "Get instant answers to your career questions with our intelligent AI assistant",
      color: "bg-blue-50 hover:bg-blue-100"
    },
    {
      icon: <FileText className="w-8 h-8 text-blue-600" />,
      title: "AI Resume Analyzer",
      description: "Detailed analysis with score and personalized improvement recommendations",
      color: "bg-blue-50 hover:bg-blue-100"
    },
    {
      icon: <Map className="w-8 h-8 text-blue-600" />,
      title: "Roadmap Generator",
      description: "Create personalized learning paths tailored to your career goals",
      color: "bg-blue-50 hover:bg-blue-100"
    },
    {
      icon: <Users className="w-8 h-8 text-blue-600" />,
      title: "Mock Interview Prep",
      description: "Practice with AI-powered interviews to boost your confidence",
      color: "bg-blue-50 hover:bg-blue-100",
      comingSoon: true
    }
  ];

  const quotes = [
    {
      text: "The future belongs to those who understand that artificial intelligence is not about replacing humans, but about augmenting human intelligence.",
      author: "Satya Nadella"
    },
    {
      text: "AI is not about the technology, it's about thinking differently about how we can use technology to transform our lives.",
      author: "Fei-Fei Li"
    },
    {
      text: "Success in creating AI would be the biggest event in human history. Unfortunately, it might also be the last.",
      author: "Stephen Hawking"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-blue-100 sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <Image src={'/logo.svg'} alt="logo" width={40} height={40} />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                LearnMate
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Clerk Authentication */}
              {!isSignedIn ? (
                <>
                  <SignInButton mode='modal' signUpForceRedirectUrl={'/dashboard'}>
                    <button className="flex items-center gap-x-2 px-4 py-2 text-blue-600 hover:text-blue-800 font-medium transition-colors">
                      <svg className="flex-shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z" />
                      </svg>
                      Sign In
                    </button>
                  </SignInButton>
                  
                  <SignInButton mode='modal' signUpForceRedirectUrl={'/dashboard'}>
                    <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl">
                      Get Started
                    </button>
                  </SignInButton>
                </>
              ) : (
                <>
                  <Link href="/dashboard">
                    <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl">
                      Dashboard
                    </button>
                  </Link>
                  <UserButton />
                </>
              )}
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            {/* Announcement Badge */}
            <Link href="https://github.com/Sidhant-singh" target="_blank" rel="noopener noreferrer">
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-8 hover:bg-blue-200 transition-colors cursor-pointer">
                <Star className="w-4 h-4 mr-2" />
                Making the world better with AI
                <svg className="flex-shrink-0 size-4 ml-2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </div>
            </Link>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Your AI-Powered
              <span className="block bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Career Coach
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
              Revolutionize your content creation with our AI-powered app, delivering engaging and high-quality apps in seconds.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {isSignedIn ? (
                <Link href="/dashboard">
                  <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center gap-2">
                    Go to Dashboard
                    <svg className="flex-shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </button>
                </Link>
              ) : (
                <SignInButton mode='modal' signUpForceRedirectUrl={'/dashboard'}>
                  <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center gap-2">
                    Start Your Journey
                    <svg className="flex-shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </button>
                </SignInButton>
              )}
              <button className="px-8 py-4 border-2 border-blue-600 text-blue-600 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-all duration-200">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Four Powerful AI Agents
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Each agent is designed to tackle specific aspects of your career development, 
              providing personalized insights and actionable recommendations.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`${feature.color} rounded-2xl p-8 transition-all duration-300 hover:shadow-lg hover:scale-105 border border-blue-100 relative overflow-hidden ${!isSignedIn ? 'cursor-pointer' : 'cursor-default'}`}
                onClick={() => !isSignedIn && !feature.comingSoon && handleProtectedNavigation('/dashboard')}
              >
                {feature.comingSoon && (
                  <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Coming Soon
                  </div>
                )}
                {!isSignedIn && !feature.comingSoon && (
                  <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Sign In Required
                  </div>
                )}
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-white rounded-xl shadow-sm">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 ml-4">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-gray-700 text-lg leading-relaxed mb-4">
                  {feature.description}
                </p>
                {isSignedIn && !feature.comingSoon ? (
                  <Link href="/dashboard">
                    <span className="inline-flex items-center gap-x-1.5 text-sm text-blue-600 decoration-2 hover:underline font-medium cursor-pointer">
                      Try Now
                      <svg className="flex-shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                    </span>
                  </Link>
                ) : feature.comingSoon ? (
                  <span className="inline-flex items-center gap-x-1.5 text-sm text-gray-400 font-medium">
                    Coming Soon
                  </span>
                ) : (
                  <SignInButton mode='modal' signUpForceRedirectUrl={'/dashboard'}>
                    <span className="inline-flex items-center gap-x-1.5 text-sm text-blue-600 decoration-2 hover:underline font-medium cursor-pointer">
                      Sign In to Access
                      <svg className="flex-shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                    </span>
                  </SignInButton>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quotes Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Wisdom from Visionaries
            </h2>
            <p className="text-xl text-gray-600">
              Insights from leaders who are shaping the future of AI
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {quotes.map((quote, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-100"
              >
                <div className="text-blue-600 mb-4">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                  </svg>
                </div>
                <blockquote className="text-gray-700 text-lg mb-6 italic leading-relaxed">
                  "{quote.text}"
                </blockquote>
                <div className="text-blue-600 font-semibold">
                  — {quote.author}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="p-8">
              <div className="text-5xl font-bold text-blue-600 mb-2">25+</div>
              <div className="text-xl text-gray-600">Templates Available</div>
            </div>
            <div className="p-8">
              <div className="text-5xl font-bold text-blue-600 mb-2">24/7</div>
              <div className="text-xl text-gray-600">Available Support</div>
            </div>
            <div className="p-8">
              <div className="text-5xl font-bold text-blue-600 mb-2">Free</div>
              <div className="text-xl text-gray-600">To Use</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Career?
          </h2>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Join thousands of professionals who are already leveraging AI to accelerate their career growth.
          </p>
          {isSignedIn ? (
            <Link href="/dashboard">
              <button className="px-10 py-4 bg-white text-blue-600 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                Go to Dashboard
              </button>
            </Link>
          ) : (
            <SignInButton mode='modal' signUpForceRedirectUrl={'/dashboard'}>
              <button className="px-10 py-4 bg-white text-blue-600 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                Get Started Now
              </button>
            </SignInButton>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">LearnMate</span>
            </div>
            <div className="text-gray-400 text-center md:text-right">
              <p>&copy; 2025 LearnMate. Empowering careers with AI.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}