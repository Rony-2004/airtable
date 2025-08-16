import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import Login from './pages/Login';
import AuthSuccess from './pages/AuthSuccess';
import Dashboard from './pages/Dashboard';
import FormBuilder from './pages/FormBuilder';
import FormViewer from './pages/FormViewer';
import './App.css';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="auth-loading"><p>Loading...</p></div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="auth-loading"><p>Loading...</p></div>;
  }
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      <Route path="/auth-success" element={<AuthSuccess />} />
      <Route path="/auth/success" element={<AuthSuccess />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/form-builder" element={
        <ProtectedRoute>
          <FormBuilder />
        </ProtectedRoute>
      } />
      <Route path="/form-builder/:id" element={
        <ProtectedRoute>
          <FormBuilder formId={window.location.pathname.split('/')[2]} />
        </ProtectedRoute>
      } />
      <Route path="/form/:id" element={
        <FormViewer formId={window.location.pathname.split('/')[2]} />
      } />
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
