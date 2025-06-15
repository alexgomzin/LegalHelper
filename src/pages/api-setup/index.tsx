'use client'

import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'

export default function ApiSetup() {
  const [apiKey, setApiKey] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)
  const router = useRouter()

  const testApiKey = async () => {
    setIsSaving(true)
    setMessage('')
    setIsError(false)

    try {
      const response = await fetch('/api/test-api-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setMessage('API key is valid! Please add it to your .env.local file as shown below.')
        setIsError(false)
      } else {
        setMessage(data.error || 'API key validation failed')
        setIsError(true)
      }
    } catch (error) {
      setMessage('Error testing API key')
      setIsError(true)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <Head>
        <title>API Setup - Legal Helper</title>
        <meta name="description" content="Configure your OpenAI API key for document analysis" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <h1 className="text-3xl font-bold mb-6">API Setup</h1>
              
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-2">Fix Mock Analysis Issue</h2>
                <p className="mb-4">
                  To use real OpenAI analysis instead of mock data, you need to:
                </p>
                
                <ol className="list-decimal pl-8 mb-6 space-y-2">
                  <li>Sign up for an <a href="https://platform.openai.com/signup" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">OpenAI API account</a></li>
                  <li>Create an API key in your <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">OpenAI dashboard</a></li>
                  <li>Add your API key to the <code className="bg-gray-100 px-2 py-1 rounded">.env.local</code> file in your project root</li>
                  <li>Restart your development server</li>
                </ol>
                
                <div className="bg-gray-100 p-4 rounded mb-6">
                  <p className="font-semibold mb-2">Add this to your .env.local file:</p>
                  <code className="block whitespace-pre border-l-4 border-blue-500 pl-3 py-2 mb-2">
                    OPENAI_API_KEY=your-api-key-here
                  </code>
                  <p className="font-semibold mb-2">Make sure these settings are correct:</p>
                  <code className="block whitespace-pre border-l-4 border-blue-500 pl-3 py-2">
                    # Disable mock analysis to use real OpenAI
                    # MOCK_ANALYSIS=true
                  </code>
                </div>
              </div>
              
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-2">Test Your API Key</h2>
                <p className="mb-4">
                  Enter your OpenAI API key below to test if it's valid:
                </p>
                
                <div className="mb-4">
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-..."
                    className="w-full px-4 py-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <button
                  onClick={testApiKey}
                  disabled={isSaving || !apiKey}
                  className={`
                    px-4 py-2 rounded text-white font-medium transition
                    ${isSaving || !apiKey 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700'}
                  `}
                >
                  {isSaving ? 'Testing...' : 'Test API Key'}
                </button>
                
                {message && (
                  <div className={`mt-4 p-3 rounded ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {message}
                  </div>
                )}
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={() => router.push('/analyze')}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Go to Analyze Page
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 