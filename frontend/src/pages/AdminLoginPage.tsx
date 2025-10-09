import React, { useState } from 'react';
import { Container, Box, TextField, Button, Typography, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login({ email, password });
      // On success, check if user is admin (mock token returns demo user not admin).
      // For demo, treat demo@example.com as admin
      if (email === 'demo@example.com') {
        // ensure token exists
        localStorage.setItem('authToken', 'mock-jwt-token');
        navigate('/admin');
      } else {
        setError('You are not an admin or credentials are invalid. Use demo@example.com / password for demo admin.');
      }
    } catch (err: any) {
      setError(err?.message || 'Login failed');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight="bold">Admin Login</Typography>
        <Typography variant="body2" color="text.secondary">Sign in with an admin account to access the admin dashboard.</Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 2 }}>
        <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth />
        <TextField label="Password" value={password} type="password" onChange={(e) => setPassword(e.target.value)} fullWidth />
        <Button type="submit" variant="contained">Sign in</Button>
      </Box>
    </Container>
  );
};

export default AdminLoginPage;
