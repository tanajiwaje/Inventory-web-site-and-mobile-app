import { Navigate, Route, Routes } from 'react-router-dom';

import { App } from './App';
import { LoginPage } from '../features/auth/LoginPage';
import { RegisterPage } from '../features/auth/RegisterPage';
import { HomePage } from '../features/public/HomePage';
import { useAuth } from '../shared/auth';

const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const { token, ready } = useAuth();
  if (!ready) {
    return <div className="d-flex align-items-center justify-content-center min-vh-100">Loading...</div>;
  }
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/login" element={<HomePage />} />
    <Route path="/register" element={<HomePage />} />
    <Route
      path="/*"
      element={
        <RequireAuth>
          <App />
        </RequireAuth>
      }
    />
  </Routes>
);
