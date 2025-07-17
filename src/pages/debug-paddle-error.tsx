import { useState } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';

export default function DebugPaddleError() {
  const { user } = useAuth();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testPaddleError = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/debug-paddle-error', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: 'pri_01jxr3y58530jpe07e9cttnamc',
          customerEmail: user?.email || 'test@example.com',
          userId: user?.id || null
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Debug Paddle Error</h1>
      
      <button 
        onClick={testPaddleError} 
        disabled={loading}
        style={{ 
          padding: '10px 20px', 
          fontSize: '16px', 
          backgroundColor: loading ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Testing...' : 'Test Paddle API Error'}
      </button>

      {result && (
        <div style={{ marginTop: '20px' }}>
          <h2>Result:</h2>
          <pre style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '15px', 
            borderRadius: '4px',
            overflow: 'auto',
            whiteSpace: 'pre-wrap'
          }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
} 