'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface DiagnosisResponse {
  threadId: string;
  question: string;
  exitCode: boolean;
}

export default function AIDiagnosisPage() {
  useSession(); // Ensure user is authenticated
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const [userResponse, setUserResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [threadId, setThreadId] = useState<string>('');
  const [isDiagnosisComplete, setIsDiagnosisComplete] = useState(false);

  // Function to start or continue the diagnosis
  const handleDiagnosis = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/ai_diagnosis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          threadId,
          userResponse: userResponse.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get diagnosis response');
      }

      const data: DiagnosisResponse = await response.json();
      
      // Set the thread ID if this is a new conversation
      if (data.threadId) {
        setThreadId(data.threadId);
      }

      // Update the current question
      setCurrentQuestion(data.question);
      setUserResponse('');

      // Check if diagnosis is complete
      if (data.exitCode) {
        setIsDiagnosisComplete(true);
      }
    } catch (err) {
      setError('An error occurred during diagnosis');
      console.error('Diagnosis error:', err);
    } finally {
      setIsLoading(false);
    }
  };



  // Start diagnosis when page loads
  if (currentQuestion === '' && !isLoading && !error) {
    handleDiagnosis();
  }

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">AI Diagnosis</h1>
        
        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        {/* Current Question */}
        {currentQuestion && (
          <div className="bg-gray-100 p-4 rounded-lg mb-6">
            <p className="text-sm font-medium text-gray-900">Question:</p>
            <p className="text-lg text-gray-700">{currentQuestion}</p>
          </div>
        )}

        {/* Current Question */}
        {!isDiagnosisComplete && currentQuestion && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-lg font-medium text-gray-900 mb-4">{currentQuestion}</p>
              <textarea
                rows={4}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={userResponse}
                onChange={(e) => setUserResponse(e.target.value)}
                placeholder="Type your response here..."
                disabled={isLoading}
              />
              <button
                onClick={handleDiagnosis}
                disabled={isLoading || !userResponse.trim()}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isLoading ? 'Processing...' : 'Submit Response'}
              </button>
            </div>
          </div>
        )}

        {/* Diagnosis Complete */}
        {isDiagnosisComplete && (
          <div className="rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Diagnosis Complete</h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>Your responses have been recorded in your medical records.</p>
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => router.push('/dashboard')}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Return to Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
