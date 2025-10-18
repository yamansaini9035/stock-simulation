import { useState, useEffect, useCallback } from 'react';

export function useSimplePolling(userId) {
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
          
          // Generate historical data for charts
          data.data.forEach(company => {
            const timestamp = Math.floor(Date.now() / 1000);
            const currentPrice = company.price;
            const change = company.change || 0;
            
            setHistoricalData(prev => {
              const existing = prev[company.symbol] || [];
              const lastCandle = existing[existing.length - 1];
              
              // Calculate realistic OHLC based on previous candle
              let open, high, low, close;
              
              if (lastCandle) {
                // Use previous close as current open
                open = lastCandle.close;
                close = currentPrice;
                
                // Create realistic high and low with proper relationships
                const priceRange = Math.abs(change) * 2; // Base range on price change
                const volatility = Math.max(priceRange * 0.1, currentPrice * 0.001); // Minimum volatility
                
                // High should be >= max(open, close)
                const maxPrice = Math.max(open, close);
                high = maxPrice + (Math.random() * volatility);
                
                // Low should be <= min(open, close)
                const minPrice = Math.min(open, close);
                low = minPrice - (Math.random() * volatility);
                
                // Ensure proper OHLC relationships
                high = Math.max(high, open, close);
                low = Math.min(low, open, close);
              } else {
                // First candle - use current price as base
                open = currentPrice;
                close = currentPrice;
                high = currentPrice * 1.002; // Small upward wick
                low = currentPrice * 0.998;  // Small downward wick
              }
              
              const historicalPoint = {
                time: timestamp,
                open: Number(open.toFixed(2)),
                high: Number(high.toFixed(2)),
                low: Number(low.toFixed(2)),
                close: Number(close.toFixed(2)),
                volume: company.volume || Math.floor(100 + Math.random() * 500),
              };
              
              const updated = [...existing, historicalPoint].slice(-100); // Keep last 100 points
              return {
                ...prev,
                [company.symbol]: updated,
              };
            });
          });
          
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
    historicalData,
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
