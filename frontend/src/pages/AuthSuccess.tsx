import React, { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

const AuthSuccess: React.FC = () => {
  const { login } = useAuth();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
      login(token);
      window.location.href = '/dashboard';
    } else {
      window.location.href = '/login?error=no_token';
    }
  }, [login]);

  return (
    <div className="auth-loading">
      <p>Authenticating...</p>
    </div>
  );
};

export default AuthSuccess;
