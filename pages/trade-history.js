import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import TradeHistoryTable from '../components/TradeHistoryTable';
import { useWS } from '../components/WebSocketProvider';

export default function TradeHistoryPage() {
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const ws = useWS();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('trading_token');
        if (!token) {
          router.push('/');
          return;
        }
        
        // Get user ID from token or localStorage
        let userId;
        try {
          // Try to parse as JWT token first
          if (token.includes('.')) {
            const tokenPayload = JSON.parse(atob(token.split('.')[1]));
            userId = tokenPayload.user?.id;
          }
        } catch (error) {
          // If JWT parsing fails, try to get user from localStorage or use fallback
          console.log('Token is not JWT format, using fallback method');
        }
        
        // If no userId from token, try to get from localStorage or use fallback
        if (!userId) {
          // Try to get user data from localStorage
          try {
            const userData = localStorage.getItem('user_data');
            if (userData) {
              const parsed = JSON.parse(userData);
              userId = parsed.id;
            }
          } catch (error) {
            console.log('No user data in localStorage');
          }
        }
        
        // If still no userId, redirect to login
        if (!userId) {
          router.push('/');
          return;
        }
        
        // Fetch portfolio to get trades
        const resp = await fetch(`/api/portfolio/${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (resp.ok) {
          const data = await resp.json();
          setUserId(userId);
          setTrades(data?.portfolio?.trades || []);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Branding and Status */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <h1 className="text-xl font-bold italic text-white">Trade Pro</h1>
            </div>
            <span className="text-sm text-gray-300">Connected</span>
          </div>

          {/* Center: Top Nav Tabs */}
          <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center space-x-2">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >Home</button>
            <button
              className="px-4 py-2 text-sm font-medium text-white border-b-2 border-teal-500"
            >Trade History</button>
          </div>

          {/* Right: User Info */}
          <div className="flex items-center space-x-4">
            {/* User ID removed */}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-xl font-semibold mb-4">Trade History</h1>
        {loading ? (
          <div className="text-gray-400">Loading...</div>
        ) : (
          <TradeHistoryTable userId={userId} trades={trades} />
        )}
      </div>
    </div>
  );
}


