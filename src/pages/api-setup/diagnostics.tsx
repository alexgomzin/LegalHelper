'use client'

import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'

interface DiagnosticsData {
  success: boolean;
  apiKeyConfigured: boolean;
  apiKeyValid?: boolean;
  mockAnalysis: boolean;
  openaiVersion?: string;
  error?: string;
  envVars: {
    [key: string]: string | undefined;
  };
  fileSystem: {
    uploadsExists: boolean;
    uploadsWritable: boolean;
  };
}

export default function DiagnosticsPage() {
  const [diagnostics, setDiagnostics] = useState<DiagnosticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchDiagnostics() {
      try {
        setLoading(true);
        const response = await fetch('/api/diagnostics');
        if (!response.ok) {
          throw new Error(`Server returned ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        setDiagnostics(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Error fetching diagnostics');
      } finally {
        setLoading(false);
      }
    }

    fetchDiagnostics();
  }, []);

  const getStatusColor = (isOk: boolean) => 
    isOk ? 'text-green-600' : 'text-red-600';

  const getStatusIcon = (isOk: boolean) => 
    isOk ? '✅' : '❌';

  return (
    <>
      <Head>
        <title>System Diagnostics - Legal Helper</title>
        <meta name="description" content="Diagnose API and system settings" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">System Diagnostics</h1>
                <button
                  onClick={() => router.push('/api-setup')}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  Back to API Setup
                </button>
              </div>
              
              {loading && (
                <div className="flex justify-center my-10">
                  <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-500 border-t-transparent"></div>
                </div>
              )}
              
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                  <p className="text-red-700">{error}</p>
                </div>
              )}
              
              {diagnostics && (
                <div className="space-y-8">
                  {/* Overall Status */}
                  <div className={`rounded-lg p-4 ${diagnostics.success ? 'bg-green-50' : 'bg-red-50'}`}>
                    <h2 className={`text-xl font-semibold ${diagnostics.success ? 'text-green-700' : 'text-red-700'}`}>
                      System Status: {diagnostics.success ? 'READY' : 'NOT READY'}
                    </h2>
                    {diagnostics.error && (
                      <p className="mt-2 text-red-600">{diagnostics.error}</p>
                    )}
                  </div>
                  
                  {/* OpenAI API Status */}
                  <div className="border rounded-lg p-4">
                    <h2 className="text-xl font-semibold mb-4">OpenAI API Configuration</h2>
                    <table className="w-full">
                      <tbody>
                        <tr className="border-b">
                          <td className="py-2 font-medium">API Key Configured</td>
                          <td className={`py-2 ${getStatusColor(diagnostics.apiKeyConfigured)}`}>
                            {getStatusIcon(diagnostics.apiKeyConfigured)}&nbsp;
                            {diagnostics.apiKeyConfigured ? 'Yes' : 'No'}
                          </td>
                        </tr>
                        {diagnostics.apiKeyConfigured && (
                          <tr className="border-b">
                            <td className="py-2 font-medium">API Key Valid</td>
                            <td className={`py-2 ${getStatusColor(diagnostics.apiKeyValid === true)}`}>
                              {getStatusIcon(diagnostics.apiKeyValid === true)}&nbsp;
                              {diagnostics.apiKeyValid === true 
                                ? 'Yes' 
                                : diagnostics.apiKeyValid === false 
                                  ? 'No' 
                                  : 'Not tested'}
                            </td>
                          </tr>
                        )}
                        <tr className="border-b">
                          <td className="py-2 font-medium">Using Mock Analysis</td>
                          <td className={`py-2 ${diagnostics.mockAnalysis ? 'text-yellow-600' : 'text-green-600'}`}>
                            {diagnostics.mockAnalysis ? '⚠️ Yes (using fake data)' : '✅ No (using real AI)'}
                          </td>
                        </tr>
                        {diagnostics.openaiVersion && (
                          <tr className="border-b">
                            <td className="py-2 font-medium">OpenAI Package Version</td>
                            <td className="py-2">{diagnostics.openaiVersion}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* File System */}
                  <div className="border rounded-lg p-4">
                    <h2 className="text-xl font-semibold mb-4">File System</h2>
                    <table className="w-full">
                      <tbody>
                        <tr className="border-b">
                          <td className="py-2 font-medium">Uploads Directory Exists</td>
                          <td className={`py-2 ${getStatusColor(diagnostics.fileSystem.uploadsExists)}`}>
                            {getStatusIcon(diagnostics.fileSystem.uploadsExists)}&nbsp;
                            {diagnostics.fileSystem.uploadsExists ? 'Yes' : 'No'}
                          </td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2 font-medium">Uploads Directory Writable</td>
                          <td className={`py-2 ${getStatusColor(diagnostics.fileSystem.uploadsWritable)}`}>
                            {getStatusIcon(diagnostics.fileSystem.uploadsWritable)}&nbsp;
                            {diagnostics.fileSystem.uploadsWritable ? 'Yes' : 'No'}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Environment Variables */}
                  <div className="border rounded-lg p-4">
                    <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
                    <table className="w-full">
                      <tbody>
                        {Object.entries(diagnostics.envVars).map(([key, value]) => (
                          <tr key={key} className="border-b">
                            <td className="py-2 font-medium">{key}</td>
                            <td className="py-2 font-mono text-sm">
                              {value !== undefined ? value : 'undefined'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Troubleshooting Actions */}
                  <div className="border rounded-lg p-4">
                    <h2 className="text-xl font-semibold mb-4">Troubleshooting Actions</h2>
                    <div className="space-y-4">
                      <button 
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 mr-2"
                      >
                        Refresh Diagnostics
                      </button>
                      
                      <button
                        onClick={() => router.push('/api-setup')}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mr-2"
                      >
                        Configure API Key
                      </button>
                      
                      <button
                        onClick={() => router.push('/analyze')}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Try Analysis
                      </button>
                    </div>
                    
                    {diagnostics.mockAnalysis && (
                      <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded">
                        <p className="text-yellow-800 font-medium">Mock Analysis Mode is Enabled</p>
                        <p className="text-sm text-yellow-700 mt-1">
                          Your app is currently using fake data for document analysis. To use real AI analysis, set <code className="bg-yellow-100 px-1 rounded">MOCK_ANALYSIS=false</code> in your <code className="bg-yellow-100 px-1 rounded">.env.local</code> file.
                        </p>
                      </div>
                    )}
                    
                    {!diagnostics.apiKeyConfigured && (
                      <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 rounded">
                        <p className="text-red-800 font-medium">API Key Not Configured</p>
                        <p className="text-sm text-red-700 mt-1">
                          Your OpenAI API key is not configured correctly. Please add a valid API key to your <code className="bg-red-100 px-1 rounded">.env.local</code> file.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 