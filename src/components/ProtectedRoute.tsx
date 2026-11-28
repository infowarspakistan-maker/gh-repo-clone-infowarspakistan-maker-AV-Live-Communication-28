import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('admin' | 'editor' | 'support' | 'customer')[];
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  allowedRoles = ['admin', 'editor', 'support'],
  redirectTo = '/admin/login',
}: ProtectedRouteProps) {
  const { user, userRole, loading, isAuthenticated, preloadAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    preloadAuth();
  }, [preloadAuth]);

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        setIsAuthorized(false);
        navigate(`${redirectTo}?redirect=${encodeURIComponent(location.pathname)}`);
        return;
      }

      // Wait briefly if Firebase user just signed in and Firestore role document is still hydrating
      if (!userRole) {
        return;
      }

      if (allowedRoles.includes(userRole)) {
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
        navigate('/admin/unauthorized');
      }
    }
  }, [loading, isAuthenticated, user, userRole, allowedRoles, navigate, location, redirectTo]);

  if (loading || !isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1A2B4C] mx-auto"></div>
          <p className="mt-4 text-gray-500 font-medium">Verifying access...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
