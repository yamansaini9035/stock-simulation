import '../styles/globals.css';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

import ErrorBoundary from '../components/ErrorBoundary';
import { WebSocketProvider } from '../components/WebSocketProvider';

export default function App({ Component, pageProps }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Check for existing authentication token
    const token = localStorage.getItem('trading_token');
    const userData = localStorage.getItem('user_data');

    if (token && userData) {
      try {
        const parsedUserData = JSON.parse(userData);
        setIsAuthenticated(true);
        setUser(parsedUserData);
      } catch (error) {
        // Clear invalid data
        localStorage.removeItem('trading_token');
        localStorage.removeItem('user_data');
      }
    }
  }, []);

  const login = (userData, token) => {
    setIsAuthenticated(true);
    setUser(userData);
    localStorage.setItem('trading_token', token);
    localStorage.setItem('user_data', JSON.stringify(userData));
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('trading_token');
    localStorage.removeItem('user_data');
    router.push('/');
  };

  return (
    <ErrorBoundary>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <WebSocketProvider userId={user?.id}>
          <Component
            {...pageProps}
            isAuthenticated={isAuthenticated}
            user={user}
            login={login}
            logout={logout}
          />
        </WebSocketProvider>
        <footer className="border-t border-slate-200 bg-white/80 px-4 py-3 text-center text-xs text-slate-600">
          © {new Date().getFullYear()} Yaman Saini · Stock Trading Simulation
        </footer>
      </div>
    </ErrorBoundary>
  );
}
