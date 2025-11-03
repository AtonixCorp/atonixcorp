import React, { useState } from 'react';
import { authService } from '../services/authService';

const __AuthTest: React.FC = () => {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testSignup = async () => {
    setLoading(true);
    try {
      const result = await authService.signup({
        username: 'testuser' + Date.now(),
        email: 'test' + Date.now() + '@example.com',
        password: 'TestPass123',
        confirm_password: 'TestPass123',
        first_name: 'Test',
        last_name: 'User',
      });
      setResult('Signup Success: ' + JSON.stringify(result));
    } catch (error) {
      setResult('Signup Error: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setLoading(false);
    }
  };

  const testLogin = async () => {
    setLoading(true);
    try {
      const result = await authService.login({
        email: 'test123@example.com',
        password: 'TestPass123',
      });
      setResult('Login Success: ' + JSON.stringify(result));
    } catch (error) {
      setResult('Login Error: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px' }}>
      <h3>Authentication Test</h3>
      <button onClick={testSignup} disabled={loading}>
        Test Signup
      </button>
      <button onClick={testLogin} disabled={loading} style={{ marginLeft: '10px' }}>
        Test Login
      </button>
      {loading && <p>Loading...</p>}
      {result && (
        <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f5f5f5' }}>
          <strong>Result:</strong>
          <pre>{result}</pre>
        </div>
      )}
    </div>
  );
};

export default __AuthTest;