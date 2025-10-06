import React, { useState } from 'react';
import { apiService } from '../services/api';

const ApiTest: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testApiConnection = async () => {
    setIsLoading(true);
    setTestResults([]);
    
    addResult('Starting API connection test...');
    addResult(`API Base URL: ${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081'}`);
    
    try {
      // Test 1: Basic health check
      addResult('Testing health endpoint...');
      await apiService.testConnection();
      addResult('Health check passed!');
      
      // Test 2: Test with fetch directly
      addResult('Testing direct fetch...');
      const response = await fetch('http://localhost:8081/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        addResult(`Direct fetch successful: ${JSON.stringify(data)}`);
        addResult(`Response headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()))}`);
      } else {
        addResult(`Direct fetch failed: ${response.status} ${response.statusText}`);
      }
      
      // Test 3: Test CORS preflight
      addResult('Testing CORS preflight...');
      const corsResponse = await fetch('http://localhost:8081/health', {
        method: 'OPTIONS',
        headers: {
          'Origin': 'http://localhost:5173',
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'Content-Type',
        },
      });
      
      if (corsResponse.ok) {
        addResult('CORS preflight successful!');
        addResult(`CORS headers: ${JSON.stringify(Object.fromEntries(corsResponse.headers.entries()))}`);
      } else {
        addResult(`CORS preflight failed: ${corsResponse.status}`);
      }
      
    } catch (error) {
      addResult(`Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('API Test Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">API Connection Test</h1>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold mb-2">Test Information</h2>
        <p className="text-sm text-gray-600 mb-2">
          This page tests the API connection and CORS configuration.
        </p>
        <div className="text-sm">
          <p><strong>Frontend URL:</strong> {window.location.origin}</p>
          <p><strong>API URL:</strong> {import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081'}</p>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={testApiConnection}
          disabled={isLoading}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium"
        >
          {isLoading ? 'Testing...' : 'Test API Connection'}
        </button>
        
        <button
          onClick={clearResults}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium"
        >
          Clear Results
        </button>
      </div>

      {testResults.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">Test Results</h3>
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`text-sm font-mono p-2 rounded ${
                  result.includes('PASSED') || result.includes('SUCCESS')
                    ? 'bg-green-100 text-green-800' 
                    : result.includes('FAILED') || result.includes('ERROR')
                    ? 'bg-red-100 text-red-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {result}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-2">Troubleshooting Tips</h3>
        <ul className="text-sm space-y-1">
          <li>• Make sure the backend is running on port 8081</li>
          <li>• Check browser console for detailed error messages</li>
          <li>• Verify CORS headers in the Network tab</li>
          <li>• Try refreshing the page if you see cached responses</li>
        </ul>
      </div>
    </div>
  );
};

export default ApiTest;
