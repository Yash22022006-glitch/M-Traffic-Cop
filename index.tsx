
import React, { useState, useCallback, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, useNavigate } from 'react-router-dom';
import MobileApp from './mobile/MobileApp';
import DashboardApp from './dashboard/DashboardApp';
import LoginPage from './mobile/LoginPage'; 
import { User, UserRole } from './types'; 
import { supabase } from './lib/supabase';
import { mapSupabaseUser, logoutUser } from './services/api';

const App: React.FC = () => {
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const navigate = useNavigate();

  // Handle Session Restoration
  useEffect(() => {
    const initSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setLoggedInUser(mapSupabaseUser(session.user));
        }
      } catch (err) {
        console.error("Session restoration error:", err);
      } finally {
        setIsInitializing(false);
      }
    };
    initSession();
  }, []);

  const handleLogin = useCallback((user: User) => {
    setLoggedInUser(user);
    navigate('/');
  }, [navigate]);

  const handleLogout = useCallback(async () => {
    await logoutUser();
    setLoggedInUser(null);
    navigate('/');
  }, [navigate]);

  const handleLoginError = useCallback((message: string) => {
    console.error("Login Error:", message); 
  }, []);

  if (isInitializing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 p-6 text-center text-white font-sans">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-6"></div>
        <h2 className="text-xl font-bold uppercase tracking-widest mb-2">Syncing with HQ...</h2>
      </div>
    );
  }

  if (!loggedInUser) {
    return <LoginPage onLogin={handleLogin} onLoginError={handleLoginError} />;
  }

  if (loggedInUser.role === UserRole.ADMIN) {
    return <DashboardApp loggedInUser={loggedInUser} onLogout={handleLogout} />;
  }

  return <MobileApp loggedInUser={loggedInUser} onLogout={handleLogout} />;
};

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <HashRouter>
        <App />
      </HashRouter>
    </React.StrictMode>
  );
}
