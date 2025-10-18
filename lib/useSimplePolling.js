import { useState, useEffect, useCallback } from 'react';

export function useSimplePolling(userId) {
  const [isConnected, setIsConnected] = useState(false);
  const [sessionStatus, setSessionStatus] = useState({
    isActive: false,
    currentTick: 0,
    companies: [],
  });
  const [priceData, setPriceData] = useState({});
  const [companies, setCompanies] = useState([]);
  const [error, setError] = useState(null);

  // Fetch price data from API
  const fetchPriceData = useCallback(async () => {
    try {
      const response = await fetch('/api/price-data');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const newData = {};
          data.data.forEach(company => {
            newData[company.symbol] = {
              price: company.price,
              change: company.change,
              changePercent: company.changePercent,
              volume: company.volume,
              timestamp: company.timestamp,
            };
          });
          
          setPriceData(newData);
          
          setSessionStatus(prev => ({
            ...prev,
            currentTick: prev.currentTick + 1,
            companies: data.data,
            isActive: true,
          }));
          
          setIsConnected(true);
          setError(null);
        }
      }
    } catch (error) {
      console.error('Polling error:', error);
      setError('Failed to fetch price data');
      setIsConnected(false);
    }
  }, []);

  // Load companies data
  const loadCompanies = useCallback(async () => {
    try {
      const response = await fetch('/api/companies');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCompanies(data.companies);
        }
      }
    } catch (error) {
      console.error('Error loading companies:', error);
      // Fallback to default companies
      const defaultCompanies = [
        { symbol: 'RELIANCE', name: 'Reliance Industries', price: 2500, volatility: 0.8 },
        { symbol: 'TCS', name: 'Tata Consultancy Services', price: 3500, volatility: 0.6 },
        { symbol: 'HDFCBANK', name: 'HDFC Bank', price: 1600, volatility: 0.7 },
        { symbol: 'INFY', name: 'Infosys', price: 1800, volatility: 0.9 },
        { symbol: 'HINDUNILVR', name: 'Hindustan Unilever', price: 2200, volatility: 0.5 },
      ];
      setCompanies(defaultCompanies);
    }
  }, []);

  // Start session
  const startSession = useCallback(async () => {
    try {
      const response = await fetch('/api/start-session', { method: 'POST' });
      if (response.ok) {
        console.log('✅ Session started');
        return true;
      }
    } catch (error) {
      console.error('Session start error:', error);
    }
    return false;
  }, []);

  useEffect(() => {
    if (userId) {
      const initialize = async () => {
        // Load companies first
        await loadCompanies();
        
        // Start session
        await startSession();
        
        // Start polling immediately
        await fetchPriceData();
        
        // Set up polling interval (every 3 seconds)
        const interval = setInterval(fetchPriceData, 3000);
        
        return () => {
          clearInterval(interval);
        };
      };
      
      initialize();
    }
  }, [userId, fetchPriceData, loadCompanies, startSession]);

  // Helper functions with better error handling
  const getCurrentPrice = useCallback((symbol) => {
    if (!priceData || !symbol) return 0;
    return priceData[symbol]?.price || 0;
  }, [priceData]);

  const getPriceChange = useCallback((symbol) => {
    if (!priceData || !symbol) return 0;
    return priceData[symbol]?.change || 0;
  }, [priceData]);

  const getPriceChangePercent = useCallback((symbol) => {
    if (!priceData || !symbol) return 0;
    return priceData[symbol]?.changePercent || 0;
  }, [priceData]);

  return {
    isConnected,
    sessionStatus,
    priceData,
    historicalData: {}, // Empty for now
    companies,
    orderBookData: {}, // Empty for now
    technicalIndicators: {}, // Empty for now
    leaderboardData: [], // Empty for now
    triggeredAlerts: [], // Empty for now
    newsEvents: [], // Empty for now
    error,
    getCurrentPrice,
    getPriceChange,
    getPriceChangePercent,
    // Mock functions for compatibility
    requestChartData: () => {},
    subscribeToEvents: () => {},
    unsubscribeFromEvents: () => {},
    emitEvent: () => {},
  };
}
