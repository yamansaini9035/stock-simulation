import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

export function useWebSocket(userId) {
  const [isConnected, setIsConnected] = useState(false);
  const [sessionStatus, setSessionStatus] = useState({
    isActive: false,
    currentTick: 0,
    companies: [],
  });
  const [priceData, setPriceData] = useState({});
  const [historicalData, setHistoricalData] = useState({});
  const [companies, setCompanies] = useState([]);
  const [orderBookData, setOrderBookData] = useState({});
  const [technicalIndicators, setTechnicalIndicators] = useState({});
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [triggeredAlerts, setTriggeredAlerts] = useState([]);
  const [newsEvents, setNewsEvents] = useState([]);
  const [error, setError] = useState(null);
  
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // Get authentication token
  const getAuthToken = useCallback(() => {
    // Try to get token from cookies first (httpOnly)
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('accessToken='));
    if (tokenCookie) {
      return tokenCookie.split('=')[1];
    }
    
    // Fallback to localStorage for development
    return localStorage.getItem('trading_token');
  }, []);

  useEffect(() => {
    // Initialize WebSocket connection
    const initializeSocket = async () => {
      try {
        // Ensure Socket.IO server is initialized on Next.js API route
        try {
          await fetch('/api/socket', { method: 'GET' })
        } catch (_) {}
        const token = getAuthToken();
        const socket = io({
          transports: ['websocket', 'polling'],
          timeout: 20000,
          forceNew: true,
          path: '/api/socket',
          auth: {
            token: token,
          },
          query: {
            userId: userId,
          },
        });

        socketRef.current = socket;

        // Connection events
        socket.on('connect', () => {
          console.log('🔌 WebSocket connected');
          setIsConnected(true);
          setError(null);
          reconnectAttempts.current = 0;
          
          // Authenticate with token if available
          const token = getAuthToken();
          if (token) {
            socket.emit('authenticate', { token });
          }
        });

        socket.on('disconnect', (reason) => {
          console.log('🔌 WebSocket disconnected:', reason);
          setIsConnected(false);
          
          // Attempt to reconnect with exponential backoff
          if (reason !== 'io client disconnect' && reconnectAttempts.current < maxReconnectAttempts) {
            const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
            reconnectAttempts.current++;
            
            console.log(`🔄 Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts.current}/${maxReconnectAttempts})`);
            reconnectTimeoutRef.current = setTimeout(() => {
              initializeSocket();
            }, delay);
          } else if (reconnectAttempts.current >= maxReconnectAttempts) {
            setError('Connection failed after multiple attempts. Please refresh the page.');
          }
        });

        socket.on('connect_error', (error) => {
          console.error('❌ WebSocket connection error:', error);
          setError('Connection failed. Please check if the backend server is running.');
        });

        // Authentication events
        socket.on('authenticated', (data) => {
          console.log('✅ WebSocket authenticated:', data);
        });

        socket.on('auth_error', (error) => {
          console.error('❌ WebSocket auth error:', error);
          setError('Authentication failed. Please log in again.');
        });

        // Production-ready WebSocket events
        
        // Price update events
        socket.on('priceUpdate', (data) => {
          console.log('📊 Price update received:', data);
          
          setSessionStatus(prev => ({
            ...prev,
            currentTick: data.tick || prev.currentTick,
            companies: data.companies || prev.companies,
            isActive: true,
          }));
          
          // Update price data for each company
          const newPriceData = {};
          
          if (data.companies) {
            data.companies.forEach(company => {
              const currentPriceData = {
                price: company.price,
                change: company.change,
                changePercent: company.changePercent,
                volume: company.volume,
                timestamp: data.timestamp,
              };
              
              newPriceData[company.symbol] = currentPriceData;
              
              // Create historical data point for charts
              const timestamp = data.timestamp instanceof Date ? data.timestamp : new Date(data.timestamp);
              const change = company.change || 0;
              const basePrice = company.price;
              
              // Create more realistic OHLC data for proper candlesticks
              const priceVolatility = basePrice * 0.002; // 0.2% of price as base volatility
              const randomVolatility = (Math.random() - 0.5) * priceVolatility * 3;
              const trendFactor = change * 0.8; // Use most of the change for trend
              
              // Calculate OHLC with proper relationships
              const open = basePrice - change + randomVolatility;
              const close = basePrice;
              const bodySize = Math.abs(close - open);
              const wickSize = bodySize * (0.5 + Math.random() * 0.5); // Random wick size
              
              // Ensure proper OHLC relationships
              const high = Math.max(open, close) + wickSize;
              const low = Math.min(open, close) - wickSize;
              
              const historicalPoint = {
                time: Math.floor(timestamp.getTime() / 1000), // Unix timestamp
                open: Math.max(0.01, open), // Ensure positive price
                high: Math.max(0.01, high), // Ensure positive price
                low: Math.max(0.01, low),   // Ensure positive price
                close: Math.max(0.01, close), // Ensure positive price
                volume: company.volume || Math.floor(Math.random() * 10000) + 1000,
              };
              
              // Add to historical data array
              setHistoricalData(prev => {
                const existing = prev[company.symbol] || [];
                const updated = [...existing, historicalPoint].slice(-100); // Keep last 100 points
                return {
                  ...prev,
                  [company.symbol]: updated,
                };
              });
            });
          }
          
          setPriceData(newPriceData);

          // Persist latest prices snapshot for instant restore after navigation
          try {
            localStorage.setItem('price_snapshot', JSON.stringify({ data: newPriceData, ts: Date.now() }));
          } catch (_) {}
        });

        // Trade executed events
        socket.on('tradeExecuted', (data) => {
          console.log('💰 Trade executed:', data);
          
          // Update portfolio data in real-time
          if (data.userId === userId) {
            // Trigger portfolio refresh
            window.dispatchEvent(new CustomEvent('portfolioUpdate', { detail: data }));
          }
          
          // Update order book if this affects the selected symbol
          if (data.symbol) {
            setOrderBookData(prev => ({
              ...prev,
              [data.symbol]: {
                ...prev[data.symbol],
                lastTrade: {
                  price: data.price,
                  quantity: data.quantity,
                  timestamp: data.timestamp,
                },
              },
            }));
          }
        });

        // Order update events
        socket.on('orderUpdate', (data) => {
          console.log('📋 Order update:', data);
          
          if (data.userId === userId) {
            // Trigger orders panel refresh
            window.dispatchEvent(new CustomEvent('orderUpdate', { detail: data }));
          }
        });

        // Leaderboard update events
        socket.on('leaderboardUpdate', (data) => {
          console.log('🏆 Leaderboard update:', data);
          setLeaderboardData(data.leaderboard || []);
        });

        // Alert triggered events
        socket.on('alertTriggered', (data) => {
          console.log('🚨 Alert triggered:', data);
          
          if (data.userId === userId) {
            setTriggeredAlerts(prev => [...prev, data].slice(-10)); // Keep last 10 alerts
            
            // Show notification
            if (data.showNotification !== false) {
              window.dispatchEvent(new CustomEvent('alertNotification', { detail: data }));
            }
          }
        });

        // News events
        socket.on('newsEvent', (data) => {
          console.log('📰 News event:', data);
          setNewsEvents(prev => [data, ...prev].slice(-20)); // Keep last 20 news events
        });

        // Technical indicators update
        socket.on('indicatorsUpdate', (data) => {
          console.log('📈 Technical indicators update:', data);
          setTechnicalIndicators(prev => ({
            ...prev,
            [data.symbol]: data.indicators,
          }));
        });

        // Order book updates
        socket.on('orderBookUpdate', (data) => {
          console.log('📊 Order book update:', data);
          setOrderBookData(prev => ({
            ...prev,
            [data.symbol]: data.orderBook,
          }));
        });

        // Chart data events
        socket.on('chartData', (data) => {
          console.log('📈 Chart data received for:', data.symbol);
          setHistoricalData(prev => ({
            ...prev,
            [data.symbol]: data.data,
          }));
        });

        socket.on('chartDataError', (error) => {
          console.error('❌ Chart data error:', error);
        });

        // Subscribe to events
        socket.emit('subscribe', {
          events: ['priceUpdate', 'tradeExecuted', 'orderUpdate', 'leaderboardUpdate', 'alertTriggered', 'newsEvent'],
        });

        // Load initial companies data
        loadCompanies();

      } catch (error) {
        console.error('❌ Error initializing WebSocket:', error);
        setError('Failed to connect to server. Please try again.');
      }
    };

    // Load companies data
    const loadCompanies = async () => {
      try {
        const response = await fetch('/api/companies');
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setCompanies(data.companies);
          }
        }
      } catch (error) {
        console.error('❌ Error loading companies:', error);
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
    };

    // Seed state from cached snapshot for instant UI while socket connects
    try {
      const cached = localStorage.getItem('price_snapshot');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.data) {
          setPriceData(parsed.data);
        }
      }
    } catch (_) {}

    if (userId) {
      initializeSocket();
    }

    // Cleanup on unmount
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [userId, getAuthToken]);

  // Helper function to get current price
  const getCurrentPrice = useCallback((symbol) => {
    if (!priceData || !symbol) return 0;
    return priceData[symbol]?.price || 0;
  }, [priceData]);

  // Helper function to get price change
  const getPriceChange = useCallback((symbol) => {
    if (!priceData || !symbol) return 0;
    return priceData[symbol]?.change || 0;
  }, [priceData]);

  // Helper function to get price change percentage
  const getPriceChangePercent = useCallback((symbol) => {
    if (!priceData || !symbol) return 0;
    return priceData[symbol]?.changePercent || 0;
  }, [priceData]);

  // Request chart data for a symbol
  const requestChartData = useCallback((symbol) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('getChartData', { symbol });
    }
  }, [isConnected]);

  // Subscribe to specific events
  const subscribeToEvents = useCallback((events) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('subscribe', { events });
    }
  }, [isConnected]);

  // Unsubscribe from events
  const unsubscribeFromEvents = useCallback((events) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('unsubscribe', { events });
    }
  }, [isConnected]);

  // Send custom event
  const emitEvent = useCallback((event, data) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit(event, data);
    }
  }, [isConnected]);

  return {
    isConnected,
    sessionStatus,
    priceData,
    historicalData,
    companies,
    orderBookData,
    technicalIndicators,
    leaderboardData,
    triggeredAlerts,
    newsEvents,
    error,
    getCurrentPrice,
    getPriceChange,
    getPriceChangePercent,
    requestChartData,
    subscribeToEvents,
    unsubscribeFromEvents,
    emitEvent,
  };
}