import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { Loader2 } from 'lucide-react';

export const AuthCallback = () => {
  const { handleGoogleCallback } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent double processing in React StrictMode
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processSession = async () => {
      const hash = location.hash;
      const params = new URLSearchParams(hash.replace('#', ''));
      const sessionId = params.get('session_id');

      if (sessionId) {
        try {
          const userData = await handleGoogleCallback(sessionId);
          navigate('/dashboard', { replace: true, state: { user: userData } });
        } catch (error) {
          console.error('Auth callback error:', error);
          navigate('/login', { replace: true, state: { error: 'Authentication failed' } });
        }
      } else {
        // No session ID - try checking existing auth
        navigate('/dashboard', { replace: true });
      }
    };

    processSession();
  }, [handleGoogleCallback, navigate, location.hash]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
        <p className="text-lg font-medium text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
};