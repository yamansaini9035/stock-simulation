import { useRouter } from 'next/router';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';

import { useWS } from './WebSocketProvider';
import { formatTime, formatCurrency } from '../lib/utils';

import AdvancedChart from './AdvancedChart';
import AlertsPanel from './AlertsPanel';
import ChartControls from './ChartControls';
import ChartSwitcher from './ChartSwitcher';
import CompanyInfoPanel from './CompanyInfoPanel';
import LeaderboardPanel from './LeaderboardPanel';
import MarketDepth from './MarketDepth';
import NewsPanel from './NewsPanel';
import OrdersPanel from './OrdersPanel';
// import TradingViewPortfolioEnhanced from './TradingViewPortfolioEnhanced' // DELETED - using TradingViewPortfolio instead
import RiskMetricsPanel from './RiskMetricsPanel';
import RSIPanel from './RSIPanel';
import SessionAnalytics from './SessionAnalytics';
import SummaryScreen from './SummaryScreen';
import TradeHistoryTable from './TradeHistoryTable';
import TradingViewPortfolio from './TradingViewPortfolio';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import WatchlistSidebar from './WatchlistSidebar';


export default function DashboardNew({ user, logout }) {
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [companyInfoData, setCompanyInfoData] = useState({});
  const [showSummary, setShowSummary] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Phase 4: Chart and Analytics state
  const [chartType, setChartType] = useState('candlestick');
  const [indicators, setIndicators] = useState({
    sma: true,
    ema: false,
    rsi: false,
    bb: false,
    macd: false,
  });
  const [showSessionAnalytics, setShowSessionAnalytics] = useState(false);
  const [indicatorData, setIndicatorData] = useState({});
  
  // Phase 5: Leaderboard, Risk Metrics & Alerts state
  const [riskMetrics, setRiskMetrics] = useState(null);
  const [userAlerts, setUserAlerts] = useState([]);
  const [triggeredAlerts, setTriggeredAlerts] = useState([]);
  
  // Phase 6: News Events state
  const [newsEvents, setNewsEvents] = useState([]);
  const [newsLoading, setNewsLoading] = useState(false);
  
  // Portfolio state from database
  const [userData, setUserData] = useState({
    balance: 10000,
    holdings: [],
    trades: [],
    orders: [],
    totalValue: 10000,
    id: user?.id || 'fallback-user-1',
  });
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  // Update userData when user prop changes
  useEffect(() => {
    if (user?.id) {
      setUserData(prev => ({
        ...prev,
        id: user.id,
      }));
    }
  }, [user?.id]);

  // WebSocket connection
  const {
    isConnected,
    sessionStatus,
    priceData,
    historicalData,
    orderBookData,
    technicalIndicators,
    leaderboardData,
    triggeredAlerts: wsTriggeredAlerts,
    newsEvents: wsNewsEvents,
    getCurrentPrice,
    getPriceChange,
    getPriceChangePercent,
  } = useWS() || {};

  // Load companies and user data on component mount
  useEffect(() => {
    const loadAllData = async () => {
      try {
        setLoading(true);
        
        // Load companies list from API
        const companiesResponse = await fetch('/api/companies');
        const companiesData = await companiesResponse.json();
        if (companiesData.success) {
          setCompanies(companiesData.companies);
        }
        
        // Load company information data
        const companyInfoResponse = await fetch('/data/companyData.json');
        const companyInfoData = await companyInfoResponse.json();
        setCompanyInfoData(companyInfoData);
        
        // Load user data from database
        await loadUserData();
        
        // Load orders from database
        await loadOrders();
        
        // Auto-start session
        await startSession();
        
        // Phase 5: Load risk metrics and alerts
        await loadRiskMetrics();
        await loadUserAlerts();
        
        // Phase 6: Load news events
        await loadNewsEvents();
        
        // Restore last selected symbol quickly if available
        try {
          const savedSymbol = localStorage.getItem('selected_symbol');
          if (savedSymbol && Array.isArray(companiesData?.companies)) {
            const found = companiesData.companies.find(c => c.symbol === savedSymbol);
            if (found) setSelectedCompany(found);
          }
        } catch {}
        // Fallback to first company as default
        if (!selectedCompany && Array.isArray(companiesData?.companies) && companiesData.companies.length > 0) {
          setSelectedCompany(companiesData.companies[0]);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadAllData();
  }, [user?.id]);

  // Persist selected symbol so it restores instantly after navigation
  useEffect(() => {
    if (selectedCompany?.symbol) {
      try { localStorage.setItem('selected_symbol', selectedCompany.symbol) } catch {}
    }
  }, [selectedCompany?.symbol]);

  // Load user data from database
  const loadUserData = async () => {
    try {
      const token = localStorage.getItem('trading_token');
      if (!token || !user?.id) return;

      const response = await fetch(`/api/portfolio/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(prev => ({
          balance: data.portfolio?.balance ?? prev.balance ?? 10000,
          holdings: data.portfolio?.holdings ?? prev.holdings ?? [],
          trades: data.portfolio?.trades ?? prev.trades ?? [],
          orders: data.portfolio?.orders ?? prev.orders ?? [],
          totalValue: data.portfolio?.totalValue ?? prev.totalValue ?? 10000,
          id: data.portfolio?.id || data.user?.id || prev.id || 'fallback-user-1',
        }));
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  // Load orders from database
  const loadOrders = async () => {
    try {
      const token = localStorage.getItem('trading_token');
      if (!token) return;

      const response = await fetch('/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(prev => ({ ...prev, orders: data.orders }));
      }
    } catch (error) {
      console.error('Failed to load orders:', error);
    }
  };

  // Create new order
  const handleCreateOrder = async (side, quantity, targetPrice) => {
    try {
      const token = localStorage.getItem('trading_token');
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          symbol: selectedCompany.symbol,
          type: orderType,
          side,
          quantity,
          targetPrice,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Reload orders and user data
        await loadOrders();
        await loadUserData();
        console.log('Order created successfully');
      } else {
        console.error('Order creation failed:', result.error);
        alert(`Order creation failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Error creating order');
    }
  };

  // Cancel order
  const handleCancelOrder = async (orderId) => {
    try {
      const token = localStorage.getItem('trading_token');
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();
      
      if (result.success) {
        // Reload orders
        await loadOrders();
        console.log('Order cancelled successfully');
      } else {
        console.error('Order cancellation failed:', result.error);
        alert(`Order cancellation failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert('Error cancelling order');
    }
  };

  // Phase 4: Chart and Analytics handlers
  const handleChartTypeChange = (newChartType) => {
    setChartType(newChartType);
  };

  const handleIndicatorToggle = (indicatorId) => {
    setIndicators(prev => ({
      ...prev,
      [indicatorId]: !prev[indicatorId],
    }));
  };

  const handleIndicatorUpdate = (newIndicatorData) => {
    setIndicatorData(newIndicatorData);
  };

  const handleResetChart = () => {
    setChartType('candlestick');
    setIndicators({
      sma: true,
      ema: false,
      rsi: false,
      bb: false,
      macd: false,
    });
  };

  const handleShowSessionAnalytics = () => {
    setShowSessionAnalytics(true);
  };

  // Auto-start session function
  const startSession = async () => {
    try {
      const response = await fetch('/api/session/start', {
        method: 'POST',
      });
      
      if (response.ok) {
        console.log('✅ Session auto-started');
        setSessionStatus(prev => ({
          ...prev,
          isActive: true,
          sessionId: 'auto-session',
          startTime: new Date().toISOString(),
        }));
      }
    } catch (error) {
      console.error('Error auto-starting session:', error);
    }
  };

  const handleRestartSession = async () => {
    try {
      // Start session via API
      const response = await fetch('/api/session/start', {
        method: 'POST',
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Session started:', data);
        
        // Update local session status
        setSessionStatus({
          isActive: true,
          currentTick: 0,
          sessionId: 'api-session',
          startTime: new Date().toISOString(),
        });
      } else {
        console.error('Failed to start session');
        return;
      }
      setShowSessionAnalytics(false);
      // Reload all data
      await loadAllData();
      console.log('Session restarted successfully');
    } catch (error) {
      console.error('Error restarting session:', error);
      alert('Error restarting session');
    }
  };

  // Phase 5: Risk Metrics and Alerts handlers
  const loadRiskMetrics = async () => {
    try {
      // Compute basic client-side risk metrics from trades + portfolio
      const prices = historicalData[selectedCompany?.symbol] || []
      const closes = prices.map(p => p.close)
      const peak = closes.length ? Math.max(...closes) : 0
      const trough = closes.length ? Math.min(...closes) : 0
      const mddPct = peak ? ((peak - trough) / peak) * 100 : 0

      const tradeList = userData.trades || []
      const wins = tradeList.filter(t => t.action === 'SELL' ? t.value >= 0 : false).length
      const losses = tradeList.filter(t => t.action === 'SELL' ? t.value < 0 : false).length
      const winRate = (wins + losses) ? (wins / (wins + losses)) * 100 : 0

      // Volatility: stdev of last 30 closes
      const window = closes.slice(-30)
      const mean = window.length ? (window.reduce((a,b)=>a+b,0) / window.length) : 0
      const variance = window.length ? window.reduce((acc,v)=>acc + Math.pow(v-mean,2),0) / window.length : 0
      const stdev = Math.sqrt(variance)
      const volPct = mean ? (stdev / mean) * 100 : 0

      const sharpe = stdev ? ((closes[closes.length-1] - (closes[0]||0)) / stdev) : 0

      const riskLevel = mddPct > 20 ? { level:'Very High', score:7, maxScore:8, color:'#ef4444' }
        : mddPct > 10 ? { level:'High', score:5, maxScore:8, color:'#f97316' }
        : volPct > 10 ? { level:'Medium', score:3, maxScore:8, color:'#f59e0b' }
        : { level:'Low', score:1, maxScore:8, color:'#10b981' }

      setRiskMetrics({
        riskLevel,
        maxDrawdown: { percentage: mddPct, peakValue: peak, troughValue: trough },
        sharpeRatio: sharpe,
        winLoss: { ratio: (losses? wins/losses : wins||0), totalWins: wins, totalLosses: losses, winRate },
        volatility: { percentage: volPct },
        sortinoRatio: sharpe, // placeholder
        calmarRatio: sharpe,  // placeholder
        valueAtRisk: { var95: Math.min(20, volPct * 1.65) },
        totalReturn: closes.length && closes[0] ? ((closes[closes.length-1] - closes[0]) / closes[0]) * 100 : 0,
      })
    } catch (error) {
      console.error('Error loading risk metrics:', error);
      setRiskMetrics({});
    }
  };

  // Recompute risk metrics when inputs change
  useEffect(() => {
    loadRiskMetrics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCompany?.symbol, (historicalData[selectedCompany?.symbol] || []).length, (userData.trades || []).length]);

  const loadUserAlerts = async () => {
    try {
      const token = localStorage.getItem('trading_token');
      
      // Skip API call if no token or malformed token
      if (!token || token === 'undefined' || token === 'null') {
        console.log('⚠️ No valid token, skipping alerts load');
        setUserAlerts([]);
        return;
      }

      // Alerts API not implemented in simple backend yet
      console.log('Alerts API not available in simple backend');
      setUserAlerts([]);
      return;
    } catch (error) {
      console.error('Error loading alerts:', error);
      setUserAlerts([]);
    }
  };

  const handleCreateAlert = async (alertData) => {
    try {
      const token = localStorage.getItem('trading_token');
      // Alerts API not implemented in simple backend yet
      console.log('Alerts API not available in simple backend');
      return;
    } catch (error) {
      console.error('Error creating alert:', error);
      alert('Error creating alert');
    }
  };

  const handleDeleteAlert = async (alertId) => {
    try {
      const token = localStorage.getItem('trading_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/alerts?alertId=${alertId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (result.success) {
        await loadUserAlerts();
        console.log('Alert deleted successfully');
      } else {
        console.error('Alert deletion failed:', result.error);
        alert(`Alert deletion failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Error deleting alert:', error);
      alert('Error deleting alert');
    }
  };

  const handleDeactivateAlert = async (alertId) => {
    try {
      const token = localStorage.getItem('trading_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/alerts`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ alertId, isActive: false }),
      });

      const result = await response.json();
      if (result.alert) {
        await loadUserAlerts();
        console.log('Alert deactivated successfully');
      } else {
        console.error('Alert deactivation failed:', result.error);
        alert(`Alert deactivation failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Error deactivating alert:', error);
      alert('Error deactivating alert');
    }
  };

  // Phase 6: News click handler
  const handleNewsClick = (newsEvent) => {
    if (newsEvent.symbol && newsEvent.symbol !== 'MARKET') {
      // Find the company and set it as selected
      const company = companies.find(c => c.symbol === newsEvent.symbol);
      if (company) {
        setSelectedCompany(company);
        console.log(`Switched to ${newsEvent.symbol} due to news click`);
      }
    }
  };

  // Phase 6: Load news events
  const loadNewsEvents = async () => {
    try {
      setNewsLoading(true);
      const token = localStorage.getItem('trading_token');
      
      // Skip API call if no token or malformed token
      if (!token || token === 'undefined' || token === 'null') {
        console.log('📰 No valid token, using demo news events');
        const demoEvents = [
          {
            id: 'demo-1',
            symbol: 'RELIANCE',
            headline: 'RELIANCE reports record quarterly earnings',
            content: 'The company exceeded market expectations with strong performance.',
            impact: 'positive',
            priceImpact: 2.1,
            category: 'earnings',
            isActive: true,
            createdAt: new Date(Date.now() - 5 * 60 * 1000),
            expiresAt: new Date(Date.now() + 10 * 60 * 1000),
          },
        ];
        setNewsEvents(demoEvents);
        return;
      }

      // News API not implemented in simple backend yet
      console.log('News API not available in simple backend');
      setNewsEvents([]);
      return;
    } catch (error) {
      console.error('Error loading news events:', error);
      // Add some demo data if API fails
      const demoEvents = [
        {
          id: 'demo-1',
          symbol: 'RELIANCE',
          headline: 'RELIANCE reports record quarterly earnings',
          content: 'The company exceeded market expectations with strong performance.',
          impact: 'positive',
          priceImpact: 2.1,
          category: 'earnings',
          isActive: true,
          createdAt: new Date(Date.now() - 5 * 60 * 1000),
          expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        },
      ];
      setNewsEvents(demoEvents);
      console.log('📰 Using demo news events:', demoEvents.length);
    } finally {
      setNewsLoading(false);
    }
  };

  // Update companies with real-time prices from WebSocket
  useEffect(() => {
    if (sessionStatus.companies && sessionStatus.companies.length > 0) {
      setCompanies(prev => prev.map(company => {
        const wsCompany = sessionStatus.companies.find(c => c.symbol === company.symbol);
        if (wsCompany) {
          return {
            ...company,
            currentPrice: wsCompany.price,
            change: wsCompany.change,
            changePercent: wsCompany.changePercent,
          };
        }
        return company;
      }));
    }
  }, [sessionStatus.companies]);

  // Handle WebSocket news events
  useEffect(() => {
    if (wsNewsEvents && wsNewsEvents.length > 0) {
      setNewsEvents(prev => {
        // Merge new events with existing ones, avoiding duplicates
        const existingIds = new Set(prev.map(event => event.id));
        const newEvents = wsNewsEvents.filter(event => !existingIds.has(event.id));
        return [...newEvents, ...prev].slice(0, 50); // Keep last 50 events
      });
    }
  }, [wsNewsEvents]);

  // Get current price for selected company
  const currentPrice = selectedCompany ? getCurrentPrice(selectedCompany.symbol) : 0;
  
  // Calculate portfolio metrics
  const totalHoldingsValue = (userData.holdings || []).reduce((total, holding) => {
    const currentPrice = getCurrentPrice(holding.symbol) || holding.avgPrice;
    return total + (holding.quantity * currentPrice);
  }, 0);
  
  const totalValue = (userData.balance || 0) + totalHoldingsValue;

  // Calculate P&L for selected company
  const selectedCompanyHoldings = (userData.holdings || []).find(h => h.symbol === selectedCompany?.symbol);
  const selectedCompanyValue = selectedCompanyHoldings ? 
    selectedCompanyHoldings.quantity * currentPrice : 0;
  const selectedCompanyPnL = selectedCompanyHoldings ? 
    selectedCompanyValue - (selectedCompanyHoldings.quantity * selectedCompanyHoldings.avgPrice) : 0;

  const handleBuy = useCallback(async (quantity = 1) => {
    if (!sessionStatus.isActive || !selectedCompany || (userData.balance || 0) < (currentPrice * quantity)) return;

    try {
      console.log('🔍 Buy order - Symbol:', selectedCompany.symbol, 'Quantity:', quantity, 'Price:', currentPrice);
      console.log('🔍 User ID:', user.id);
      
      const response = await fetch('/api/trade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbol: selectedCompany.symbol,
          action: 'BUY',
          quantity: quantity,
          price: currentPrice,
          userId: user.id,
        }),
      });

      const result = await response.json();
      console.log('🔍 Buy order response:', result);
      
      if (result.success) {
        // Optimistically update local portfolio state
        setUserData(prev => {
          const newBalance = result.updatedUser?.balance ?? prev.balance
          const updatedHoldings = Array.isArray(prev.holdings) ? [...prev.holdings] : []
          const idx = updatedHoldings.findIndex(h => h.symbol === selectedCompany.symbol)
          if (idx >= 0) {
            updatedHoldings[idx] = {
              ...updatedHoldings[idx],
              quantity: result.holding?.quantity ?? updatedHoldings[idx].quantity,
              avgPrice: result.holding?.avgPrice ?? updatedHoldings[idx].avgPrice,
            }
          } else if (result.holding) {
            updatedHoldings.push(result.holding)
          }
          const newTrades = [{
            userId: user.id,
            symbol: selectedCompany.symbol,
            action: 'BUY',
            quantity: quantity,
            price: currentPrice,
            createdAt: new Date().toISOString(),
          }, ...(prev.trades || [])]
          return { ...prev, balance: newBalance, holdings: updatedHoldings, trades: newTrades }
        })
        console.log('✅ Buy order executed successfully');
        // Ensure server truth reflected
        await loadUserData();
      } else {
        console.error('❌ Buy order failed:', result.error);
        alert(`Buy order failed: ${result.error}`);
      }
    } catch (error) {
      console.error('❌ Error executing buy order:', error);
      alert('Error executing buy order');
    }
  }, [sessionStatus.isActive, selectedCompany, currentPrice, userData.balance, user.id]);

  const handleSell = useCallback(async (quantity = 1) => {
    if (!sessionStatus.isActive || !selectedCompany || !selectedCompanyHoldings || selectedCompanyHoldings.quantity < quantity) return;

    try {
      console.log('🔍 Sell order - Symbol:', selectedCompany.symbol, 'Quantity:', quantity, 'Price:', currentPrice);
      console.log('🔍 User ID:', user.id);
      
      const response = await fetch('/api/trade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbol: selectedCompany.symbol,
          action: 'SELL',
          quantity: quantity,
          price: currentPrice,
          userId: user.id,
        }),
      });

      const result = await response.json();
      console.log('🔍 Sell order response:', result);
      
      if (result.success) {
        setUserData(prev => {
          const newBalance = result.updatedUser?.balance ?? prev.balance
          const updatedHoldings = Array.isArray(prev.holdings) ? [...prev.holdings] : []
          const idx = updatedHoldings.findIndex(h => h.symbol === selectedCompany.symbol)
          if (idx >= 0) {
            updatedHoldings[idx] = {
              ...updatedHoldings[idx],
              quantity: result.holding?.quantity ?? Math.max(0, (updatedHoldings[idx].quantity || 0) - quantity),
            }
          }
          const newTrades = [{
            userId: user.id,
            symbol: selectedCompany.symbol,
            action: 'SELL',
            quantity: quantity,
            price: currentPrice,
            createdAt: new Date().toISOString(),
          }, ...(prev.trades || [])]
          return { ...prev, balance: newBalance, holdings: updatedHoldings, trades: newTrades }
        })
        console.log('✅ Sell order executed successfully');
        await loadUserData();
      } else {
        console.error('❌ Sell order failed:', result.error);
        alert(`Sell order failed: ${result.error}`);
      }
    } catch (error) {
      console.error('❌ Error executing sell order:', error);
      alert('Error executing sell order');
    }
  }, [sessionStatus.isActive, selectedCompany, currentPrice, selectedCompanyHoldings, user.id]);

  const handleCompanySelect = useCallback((company) => {
    if (company && typeof company === 'object') {
      setSelectedCompany(company);
      console.log('Selected company:', company);
    } else {
      console.error('Invalid company object:', company);
    }
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    logout();
    router.push('/');
  }, [logout, router]);

  // Do not block UI on loading; panels will hydrate progressively

  // Debug information
  console.log('🔍 Dashboard Debug Info:');
  console.log('- Selected Company:', selectedCompany);
  console.log('- Historical Data Keys:', Object.keys(historicalData));
  console.log('- Historical Data for selected:', selectedCompany ? historicalData[selectedCompany.symbol] : 'No company selected');
  console.log('- WebSocket Connected:', isConnected);
  console.log('- Session Active:', sessionStatus.isActive);
  console.log('- Current Tick:', sessionStatus.currentTick);
  console.log('- User Data:', userData);

  if (showSummary) {
    return (
      <SummaryScreen
        user={user}
        totalValue={totalValue}
        trades={userData.trades || []}
        onRestart={() => {
          setShowSummary(false);
          // Restart session logic here
        }}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
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
            <Link href="/dashboard" className={`px-4 py-2 text-sm font-medium transition-colors ${router.pathname === '/dashboard' ? 'text-white border-b-2 border-teal-500' : 'text-gray-300 hover:text-white'}`}>
              Home
            </Link>
            <Link href="/trade-history" className={`px-4 py-2 text-sm font-medium transition-colors ${router.pathname === '/trade-history' ? 'text-white border-b-2 border-teal-500' : 'text-gray-300 hover:text-white'}`}>
              Trade History
            </Link>
          </div>

          {/* Right: User Info */}
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-300">Welcome, {user?.name || user?.enrollmentNo || user?.enrollment || 'User'}</span>
            <Button
              onClick={handleLogout}
              className="bg-black text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-900 transition-colors"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-screen">
        {/* Left Sidebar - Watchlist */}
        <div className="w-80 bg-gray-900 border-r border-gray-700 overflow-y-auto">
          <WatchlistSidebar
            companies={companies}
            selectedCompany={selectedCompany}
            onCompanyChange={handleCompanySelect}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
        </div>

        {/* Center - Chart Area */}
        <div className="flex-1 flex flex-col bg-gray-900">
          {/* Top Bar - Chart Title and Current Price */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h2 className="text-lg font-semibold text-white">Real-time candlestick chart</h2>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">
                    {formatCurrency(currentPrice || 0)}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm font-medium ${
                      (getPriceChange(selectedCompany?.symbol) || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {getPriceChange(selectedCompany?.symbol) >= 0 ? '+' : ''}{formatCurrency(getPriceChange(selectedCompany?.symbol) || 0)}
                    </span>
                    <span className={`text-sm font-medium ${
                      (getPriceChangePercent(selectedCompany?.symbol) || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {getPriceChangePercent(selectedCompany?.symbol) >= 0 ? '+' : ''}{getPriceChangePercent(selectedCompany?.symbol)?.toFixed(2) || '0.00'}%
                    </span>
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-red-400 font-medium">LIVE</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chart Controls Panel */}
          <div className="p-3 border-b border-gray-700 bg-gray-800">
            <div className="flex items-center justify-between">
              {/* Chart Type Selector */}
              <div className="flex items-center space-x-4">
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleChartTypeChange('candlestick')}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
                      chartType === 'candlestick' 
                        ? 'bg-teal-600 text-white border border-teal-500' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                    }`}
                  >
                    Candlestick
                  </button>
                  <button
                    onClick={() => handleChartTypeChange('line')}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
                      chartType === 'line' 
                        ? 'bg-teal-600 text-white border border-teal-500' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                    }`}
                  >
                    Line
                  </button>
                  <button
                    onClick={() => handleChartTypeChange('volume')}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
                      chartType === 'volume' 
                        ? 'bg-teal-600 text-white border border-teal-500' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                    }`}
                  >
                    Volume
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleResetChart}
                  className="px-3 py-1 rounded-md text-xs font-medium bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600 transition-all duration-200"
                >
                  Reset Chart
                </button>
                <button
                  onClick={() => setIndicators({ sma: false, ema: false, rsi: false, bb: false, macd: false })}
                  className="px-3 py-1 rounded-md text-xs font-medium bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600 transition-all duration-200"
                >
                  Clear All
                </button>
              </div>

              {/* Inline Indicator Toggles moved below chart */}
              <div />
            </div>
          </div>

          {/* Main Chart Area */}
          <div className="flex-1 p-3 flex flex-col">
            {selectedCompany && historicalData[selectedCompany.symbol] && historicalData[selectedCompany.symbol].length > 0 ? (
              <div className="flex-1 bg-gray-800 rounded-lg border border-gray-700 flex flex-col min-h-0">
                <div className="flex-1 min-h-0 p-2">
                <AdvancedChart
                  data={historicalData[selectedCompany.symbol]}
                  selectedCompany={selectedCompany}
                  chartType={chartType}
                  indicators={indicators}
                  onIndicatorUpdate={handleIndicatorUpdate}
                />
                </div>
                {/* Indicator toggles below chart */}
                <div className="px-4 py-2 border-t border-gray-700 flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs font-medium text-gray-300">Indicators:</span>
                  <button
                    onClick={() => handleIndicatorToggle('sma')}
                    className={`px-2 py-1 rounded text-xs font-medium border transition-all duration-200 ${
                      indicators.sma ? 'bg-teal-600 text-white border-teal-500' : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                    }`}
                  >SMA</button>
                  <button
                    onClick={() => handleIndicatorToggle('ema')}
                    className={`px-2 py-1 rounded text-xs font-medium border transition-all duration-200 ${
                      indicators.ema ? 'bg-teal-600 text-white border-teal-500' : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                    }`}
                  >EMA</button>
                  <button
                    onClick={() => handleIndicatorToggle('rsi')}
                    className={`px-2 py-1 rounded text-xs font-medium border transition-all duration-200 ${
                      indicators.rsi ? 'bg-teal-600 text-white border-teal-500' : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                    }`}
                  >RSI</button>
                  <button
                    onClick={() => handleIndicatorToggle('bb')}
                    className={`px-2 py-1 rounded text-xs font-medium border transition-all duration-200 ${
                      indicators.bb ? 'bg-teal-600 text-white border-teal-500' : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                    }`}
                  >BB</button>
                  <button
                    onClick={() => handleIndicatorToggle('macd')}
                    className={`px-2 py-1 rounded text-xs font-medium border transition-all duration-200 ${
                      indicators.macd ? 'bg-teal-600 text-white border-teal-500' : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                    }`}
                  >MACD</button>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 bg-gray-800 rounded-lg border border-gray-700">
                <div className="text-center">
                  <p className="text-lg mb-2">No chart data available</p>
                  <p className="text-sm">
                    {!selectedCompany ? 'Please select a company' : 
                      !historicalData[selectedCompany.symbol] ? 'Waiting for price data...' : 
                        historicalData[selectedCompany.symbol].length === 0 ? 'No historical data points yet...' :
                          'Loading chart...'}
                  </p>
                  {selectedCompany && (
                    <div className="text-xs mt-2 space-y-1">
                      <p>Selected: {selectedCompany.symbol}</p>
                      <p>Historical data: {historicalData[selectedCompany.symbol]?.length || 0} points</p>
                      <p>WebSocket connected: {isConnected ? 'Yes' : 'No'}</p>
                      <p>Session active: {sessionStatus.isActive ? 'Yes' : 'No'}</p>
                      <p>Current tick: {sessionStatus.currentTick}</p>
                      <p>Available symbols: {Object.keys(historicalData).join(', ')}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Right Sidebar - Portfolio & Trading */}
        <div className="w-80 bg-gray-900 border-l border-gray-700 overflow-y-auto">
          <div className="p-4 space-y-6">
            <TradingViewPortfolio
              selectedCompany={selectedCompany}
              currentPrice={currentPrice}
              cash={userData.balance || 0}
              holdings={userData.holdings || []}
              companies={companies}
              selectedCompanyHoldings={selectedCompanyHoldings}
              selectedCompanyValue={selectedCompanyValue}
              selectedCompanyPnL={selectedCompanyPnL}
              totalValue={totalValue}
              totalHoldingsValue={totalHoldingsValue}
              tradesCount={userData.trades?.length || 0}
              onBuy={handleBuy}
              onSell={handleSell}
              onCreateOrder={handleCreateOrder}
              isSessionActive={sessionStatus.isActive}
            />
            
            {/* <OrdersPanel
              userId={user.id}
              orders={userData.orders || []}
              onCancelOrder={handleCancelOrder}
            /> */}
            
            {/* Trade History moved to dedicated page /trade-history */}

            {/* Phase 5: Risk Metrics Panel
            <RiskMetricsPanel
              riskMetrics={riskMetrics}
              isVisible={true}
            /> */}

            {/* Phase 5: Alerts Panel
            <AlertsPanel
              alerts={userAlerts.filter(alert => alert.isActive)}
              triggeredAlerts={userAlerts.filter(alert => alert.triggeredAt)}
              onCreateAlert={handleCreateAlert}
              onDeleteAlert={handleDeleteAlert}
              onDeactivateAlert={handleDeactivateAlert}
              isVisible={true}
            /> */}

            {/* Phase 5: Leaderboard Panel */}
            <LeaderboardPanel
              leaderboardData={leaderboardData}
              currentUserId={user.id}
              isVisible={true}
            />

            {/* Phase 6: News Panel
            <NewsPanel
              newsEvents={newsEvents}
              onNewsClick={handleNewsClick}
              isVisible={true}
              className="min-h-[400px]"
              loading={newsLoading}
            /> */}

            {/* Session Analytics Button */}
            {/* <div className="pt-4">
              <Button
                onClick={handleShowSessionAnalytics}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                📊 Session Analytics
              </Button>
            </div> */}
          </div>
        </div>
      </div>

      {/* Bottom Panels */}
      <div className="bg-gray-800 border-t border-gray-700 p-4 min-h-[320px]">
        <div className="grid grid-cols-4 gap-4 h-full">
          {/* Company Info Panel (dynamic) */}
          <div className="bg-gray-900 rounded-lg p-5 border border-gray-700 flex flex-col">
            <div className="flex-1">
              <CompanyInfoPanel
                symbol={selectedCompany?.symbol}
                companyData={companyInfoData?.[selectedCompany?.symbol]}
                currentPrice={currentPrice}
                isCompactView={true}
              />
              </div>
              </div>

          {/* Market Depth (live order book) */}
          <div className="bg-gray-900 rounded-lg p-5 border border-gray-700 flex flex-col">
            <div className="flex-1">
              <MarketDepth orderBookData={selectedCompany ? orderBookData[selectedCompany.symbol] : null} isCompactView={true} />
              </div>
              </div>

          {/* Market Events Box (live news) */}
          <div className="bg-gray-900 rounded-lg p-5 border border-gray-700 flex flex-col">
            <div className="flex-1 flex flex-col">
              {/* Market Events Header */}
              <div className="flex-shrink-0 mb-3">
                <h2 className="text-2xl font-bold text-white mb-1">Market Events</h2>
                <p className="text-sm text-gray-400">Live market news & updates</p>
          </div>

              {/* Events List - Show 5 Events with Scroll */}
              <div className="overflow-y-auto space-y-3 pr-2" style={{ height: '540px', scrollbarWidth: 'thin', scrollbarColor: '#4B5563 transparent' }}>
                {(newsEvents && newsEvents.length > 0) ? (
                  newsEvents.slice(0, 8).map((evt) => (
                    <div key={evt.id} className="p-3 rounded-md border border-gray-700 bg-gray-800/60 hover:bg-gray-800/80 transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-cyan-300">{evt.symbol || 'MARKET'}</span>
                        <span className={`text-xs font-medium px-2 py-1 rounded ${evt.impact === 'positive' ? 'bg-green-500/20 text-green-400' : evt.impact === 'negative' ? 'bg-red-500/20 text-red-400' : 'bg-gray-500/20 text-gray-300'}`}>
                          {evt.impact}
                        </span>
              </div>
                      <div className="text-sm text-white font-medium">{evt.headline}</div>
                      {evt.priceImpact != null && (
                        <div className="text-xs text-gray-400 mt-1">Impact: {evt.priceImpact}%</div>
                      )}
              </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="text-gray-400 text-sm">No market events yet</div>
                      <div className="text-xs text-gray-500 mt-1">Live updates will appear here</div>
              </div>
            </div>
                )}
              </div>
            </div>
          </div>

          {/* Risk Metrics Box - render live metrics */}
          <div className="bg-gray-900 rounded-lg p-5 border border-gray-700 flex flex-col">
            <div className="flex-1">
              <RiskMetricsPanel riskMetrics={riskMetrics} isVisible={true} isCompactView={true} />
            </div>
          </div>

          {/* Leaderboard Box */}
          {/* <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Leaderboard</h3>
            <div className="space-y-2">
              <div className="text-xs text-gray-400">
                Top performers ranking will appear here
              </div>
            </div>
          </div> */}
        </div>
      </div>

      {/* Session Analytics Modal */}
      <SessionAnalytics
        userData={userData}
        sessionStatus={sessionStatus}
        onRestartSession={handleRestartSession}
        isVisible={showSessionAnalytics}
      />
    </div>
  );
}
