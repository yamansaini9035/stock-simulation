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
  const [orderBookData, setOrderBookData] = useState({});
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
            // Skip invalid company data
            if (!company || !company.symbol || !company.price || typeof company.price !== 'number') {
              return;
            }
            
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
              
              // Validate all values before creating the point
              const validatedOpen = Math.max(0.01, Number(open.toFixed(2)));
              const validatedHigh = Math.max(0.01, Number(high.toFixed(2)));
              const validatedLow = Math.max(0.01, Number(low.toFixed(2)));
              const validatedClose = Math.max(0.01, Number(close.toFixed(2)));
              const validatedVolume = Math.max(1, company.volume || Math.floor(100 + Math.random() * 500));
              
              // Ensure proper OHLC relationships
              const finalHigh = Math.max(validatedOpen, validatedClose, validatedHigh);
              const finalLow = Math.min(validatedOpen, validatedClose, validatedLow);
              
              const historicalPoint = {
                time: timestamp,
                open: validatedOpen,
                high: finalHigh,
                low: finalLow,
                close: validatedClose,
                volume: validatedVolume,
              };
              
              // Filter out any invalid points before adding
              const validPoints = [...existing, historicalPoint].filter(point => 
                point && 
                typeof point.time === 'number' && 
                typeof point.open === 'number' && 
                typeof point.high === 'number' && 
                typeof point.low === 'number' && 
                typeof point.close === 'number' && 
                typeof point.volume === 'number' &&
                point.open > 0 && 
                point.high > 0 && 
                point.low > 0 && 
                point.close > 0 && 
                point.volume > 0
              ).slice(-100); // Keep last 100 points
              
              return {
                ...prev,
                [company.symbol]: validPoints,
              };
            });
          });
          
          // Generate market depth (order book) data
          data.data.forEach(company => {
            const midPrice = company.price;
            const levels = 10;
            const pctStep = 0.0005; // 0.05% per level
            const bids = [];
            const asks = [];
            
            // Generate bid levels (below mid price)
            for (let i = 0; i < levels; i++) {
              const bidPrice = Math.max(0.01, midPrice * (1 - pctStep * (i + 1)));
              const bidQuantity = Math.floor(50 + Math.random() * 500);
              bids.push({ 
                price: Number(bidPrice.toFixed(2)), 
                quantity: bidQuantity 
              });
            }
            
            // Generate ask levels (above mid price)
            for (let i = 0; i < levels; i++) {
              const askPrice = midPrice * (1 + pctStep * (i + 1));
              const askQuantity = Math.floor(50 + Math.random() * 500);
              asks.push({ 
                price: Number(askPrice.toFixed(2)), 
                quantity: askQuantity 
              });
            }
            
            const bestBid = bids[0];
            const bestAsk = asks[0];
            const spread = bestAsk.price - bestBid.price;
            
            setOrderBookData(prev => ({
              ...prev,
              [company.symbol]: {
                bids,
                asks,
                bestBid,
                bestAsk,
                spread: Number(spread.toFixed(2)),
                midPrice: Number(midPrice.toFixed(2)),
                timestamp: Date.now()
              }
            }));
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
    orderBookData,
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
