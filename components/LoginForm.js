import { useRouter } from 'next/router';
import { useState } from 'react';

import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';

export default function LoginForm({ login }) {
  const [enrollment, setEnrollment] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate enrollment number (backend only requires non-empty string)
    if (!enrollment) {
      setError('Enrollment number is required');
      setLoading(false);
      return;
    }

    try {
      const endpoint = isSignUp ? '/api/auth/register' : '/api/auth/login';
      const payload = isSignUp
        ? { enrollmentNo: enrollment, password, name }
        : { enrollmentNo: enrollment, password };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // receive httpOnly cookies
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data?.success) {
        // Persist/display name for signup or reuse stored name for login
        if (isSignUp && name) {
          try { localStorage.setItem('display_name', name); } catch {}
        }
        const storedName = (() => { try { return localStorage.getItem('display_name'); } catch { return null; } })();
        const effectiveName = isSignUp ? name : (data.user?.name || storedName);
        const userWithName = effectiveName ? { ...data.user, name: effectiveName } : data.user;
        login(userWithName, null);
        router.push('/dashboard');
      } else {
        setError(data?.error || 'Authentication failed');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      setError(`Network error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Cosmic Astronaut Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Cosmic Background with Aurora */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          {/* Aurora Effect */}
          <div className="absolute inset-0 opacity-60">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-purple-500/20 via-teal-500/20 to-green-500/20 animate-pulse"></div>
            <div className="absolute top-1/4 left-0 w-full h-1/2 bg-gradient-to-r from-teal-400/30 via-purple-400/30 to-green-400/30 blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 right-0 w-1/2 h-1/3 bg-gradient-to-l from-green-400/25 via-teal-400/25 to-purple-400/25 blur-2xl animate-pulse delay-2000"></div>
          </div>
          
          {/* Stars */}
          <div className="absolute inset-0">
            {[...Array(100)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${2 + Math.random() * 2}s`,
                }}
              />
            ))}
          </div>
          
          {/* Astronaut Silhouette */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-8">
            <div className="relative">
              {/* Astronaut Body */}
              <div className="w-32 h-40 bg-gradient-to-b from-gray-300 to-gray-500 rounded-t-full relative">
                {/* Helmet */}
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-24 h-24 bg-gradient-to-b from-gray-200 to-gray-400 rounded-full border-4 border-gray-300">
                  {/* Visor */}
                  <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-16 h-8 bg-gradient-to-b from-cyan-200/30 to-cyan-400/50 rounded-full"></div>
                </div>
                {/* Arms */}
                <div className="absolute top-8 -left-4 w-6 h-16 bg-gradient-to-b from-gray-300 to-gray-500 rounded-full transform rotate-12"></div>
                <div className="absolute top-8 -right-4 w-6 h-16 bg-gradient-to-b from-gray-300 to-gray-500 rounded-full transform -rotate-12"></div>
                {/* Legs */}
                <div className="absolute bottom-0 left-4 w-8 h-12 bg-gradient-to-b from-gray-300 to-gray-500 rounded-t-full"></div>
                <div className="absolute bottom-0 right-4 w-8 h-12 bg-gradient-to-b from-gray-300 to-gray-500 rounded-t-full"></div>
              </div>
            </div>
          </div>
          
          {/* Inspirational Text Overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center px-8">
              <h1 className="text-6xl font-bold text-white mb-4 leading-tight">
                Look first
              </h1>
              <h2 className="text-6xl font-bold text-white leading-tight">
                Then leap.
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login/Signup Form */}
      <div className="w-full lg:w-1/2 bg-black flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-8">
          <div></div>
          <div className="text-2xl font-bold text-white">
            Trading Pro
          </div>
        </div>

        {/* Main Form Area */}
        <div className="flex-1 flex items-center justify-center px-8">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-white mb-2">
                {isSignUp ? 'Sign up' : 'Welcome back'}
              </h2>
              <p className="text-white">
                {isSignUp ? 'Create your trading account' : 'Sign in to your account'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {isSignUp && (
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-white">
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all duration-200"
                  />
                </div>
              )}
              <div className="space-y-2">
                <label htmlFor="enrollment" className="text-sm font-medium text-white">
                  Enrollment Number
                </label>
                <input
                  id="enrollment"
                  type="text"
                  placeholder="Enter 11-digit enrollment number"
                  value={enrollment}
                  onChange={(e) => setEnrollment(e.target.value)}
                  maxLength={11}
                  className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all duration-200"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-white">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all duration-200"
                />
              </div>

              {error && (
                <div className="text-red-400 text-sm text-center bg-red-900/20 p-3 rounded-lg border border-red-500/30">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing In...' : (isSignUp ? 'Create Account' : 'Sign In')}
              </button>
            </form>

            {/* Demo Credentials */}
            {/* <div className="mt-8 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <h4 className="text-sm font-semibold text-white mb-2">Demo Credentials:</h4>
              <div className="space-y-1 text-sm text-white">
                <p>Enrollment: <span className="font-mono text-teal-400">12345678901</span></p>
                <p>Password: <span className="font-mono text-teal-400">password123</span></p>
              </div>
            </div> */}
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 text-center">
          <p className="text-white text-sm">
            {isSignUp ? 'Already have an account?' : 'Don\'t have an account?'}{' '}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-teal-400 hover:text-teal-300 font-medium transition-colors duration-200"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
