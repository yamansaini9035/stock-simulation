import { useState, useEffect, useCallback } from 'react';

export function usePolling(userId) {
  const [isConnected, setIsConnected] = useState(false);
  const [sessionStatus, setSessionStatus] = useState({
    isActive: false,
    currentTick: 0,
    companies: [],
  });
  const [priceData, setPriceData] = useState({});
  const [historicalData, setHistoricalData] = useState({});
  const [companies, setCompanies] = useState([]);
  const [error, setError] = useState(null);
  const [pollingInterval, setPollingInterval] = useState(null);

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

  useEffect(() => {
    if (userId) {
      // Load companies first
      loadCompanies();
      
      // Start session and polling immediately
      const startSessionAndPolling = async () => {
        try {
          // Start session
          const sessionResponse = await fetch('/api/start-session', { method: 'POST' });
          if (sessionResponse.ok) {
            console.log('✅ Session started via polling fallback');
          }
        } catch (error) {
          console.log('⚠️ Session start failed, continuing with polling');
        }
        
        // Start polling immediately
        fetchPriceData();
        
        // Set up polling interval (every 3 seconds)
        const interval = setInterval(fetchPriceData, 3000);
        setPollingInterval(interval);
      };
      
      startSessionAndPolling();
      
      return () => {
        if (pollingInterval) {
          clearInterval(pollingInterval);
        }
      };
    }
  }, [userId, fetchPriceData, loadCompanies]);

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
    historicalData,
    companies,
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
