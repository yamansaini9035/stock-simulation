import { createChart, CandlestickSeries } from 'lightweight-charts';
import { useEffect, useRef, useState } from 'react';

import { formatCurrency } from '../lib/utils';

export default function CandlestickChart({ data, currentPrice, companyName, isDark = true, startPrice = null }) {
  const chartContainerRef = useRef();
  const chartRef = useRef();
  const candlestickSeriesRef = useRef();

  // Calculate net change and percentage change
  const netChange = startPrice ? currentPrice - startPrice : 0;
  const percentageChange = startPrice ? (netChange / startPrice) * 100 : 0;
  const isPositive = netChange >= 0;

  // Convert line data to candlestick data
  const generateCandlestickData = (lineData) => {
    if (!lineData || lineData.length === 0) return [];
    
    const candlestickData = [];
    
    for (let i = 0; i < lineData.length; i++) {
      const current = lineData[i];
      const previous = i > 0 ? lineData[i - 1] : current;
      
      // Generate OHLC from price data with realistic candle patterns
      const open = previous.price;
      const close = current.price;
      
      // Create realistic high/low based on price movement and volatility
      const priceChange = close - open;
      const baseVolatility = Math.abs(priceChange) * 0.5 + 0.1; // Base volatility
      const randomVolatility = Math.random() * 0.3; // Additional randomness
      const totalVolatility = baseVolatility + randomVolatility;
      
      // Ensure high is always >= max(open, close) and low is always <= min(open, close)
      const high = Math.max(open, close) + (Math.random() * totalVolatility);
      const low = Math.min(open, close) - (Math.random() * totalVolatility);
      
      // Use proper time format - lightweight-charts expects either string or number
      // Create a proper timestamp for each tick (7 seconds apart)
      const baseTime = new Date('2024-01-01T09:00:00').getTime() / 1000; // Start at 9 AM
      const timeValue = baseTime + (i * 7); // Each tick is 7 seconds apart
      
      candlestickData.push({
        time: timeValue,
        open: Number(open.toFixed(2)),
        high: Number(high.toFixed(2)),
        low: Number(low.toFixed(2)),
        close: Number(close.toFixed(2)),
      });
    }
    
    return candlestickData;
  };

  useEffect(() => {
    if (!chartContainerRef.current || !data || data.length === 0) return;

    // Create chart with optimized configuration for better readability
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 500,
      layout: {
        background: { color: '#000000' },
        textColor: '#FFFFFF',
        fontSize: 11,
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      },
      grid: {
        vertLines: { 
          visible: false,
        },
        horzLines: { 
          visible: false,
        },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: '#00E676',
          width: 1,
          style: 2,
          labelBackgroundColor: '#181920',
        },
        horzLine: {
          color: '#00E676',
          width: 1,
          style: 2,
          labelBackgroundColor: '#181920',
        },
      },
      rightPriceScale: {
        borderColor: '#FFFFFF',
        scaleMargins: {
          top: 0.15,
          bottom: 0.15,
        },
        textColor: '#FFFFFF',
        fontSize: 10,
      },
      timeScale: {
        borderColor: '#FFFFFF',
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 12,
        barSpacing: 8, // Increased for better readability
        minBarSpacing: 2,
        fixLeftEdge: true,
        fixRightEdge: true,
        lockVisibleTimeRangeOnResize: true,
      },
      watermark: {
        visible: false, // Disabled for cleaner look
      },
    });

    chartRef.current = chart;

    // Add candlestick series with cosmic dark theme colors
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#00E676', // Vibrant green for gains
      downColor: '#FF5252', // Sharp red for losses
      borderDownColor: '#FF5252',
      borderUpColor: '#00E676',
      wickDownColor: '#FF5252',
      wickUpColor: '#00E676',
      borderVisible: true,
      wickVisible: true,
    });
    candlestickSeriesRef.current = candlestickSeries;

    // Generate and set data
    const candlestickData = generateCandlestickData(data);
    
    // Validate data before setting
    if (candlestickData.length > 0 && candlestickData[0].time !== undefined && !isNaN(candlestickData[0].time)) {
      candlestickSeries.setData(candlestickData);
    } else {
      console.error('Invalid candlestick data:', candlestickData.slice(0, 3));
    }

    // ResizeObserver for better responsiveness
    const resizeObserver = new ResizeObserver(entries => {
      if (entries.length === 0 || entries[0].target !== chartContainerRef.current) return;
      const newRect = entries[0].contentRect;
      chart.applyOptions({ 
        width: newRect.width,
        height: newRect.height || 500,
      });
    });

    resizeObserver.observe(chartContainerRef.current);

    // Fallback resize handler
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ 
          width: chartContainerRef.current.clientWidth, 
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data, companyName]);

  // Update data when it changes
  useEffect(() => {
    if (candlestickSeriesRef.current && data && data.length > 0) {
      const candlestickData = generateCandlestickData(data);
      
      // Validate data before setting
      if (candlestickData.length > 0 && candlestickData[0].time !== undefined && !isNaN(candlestickData[0].time)) {
        candlestickSeriesRef.current.setData(candlestickData);
      } else {
        console.error('Invalid candlestick data in update:', candlestickData.slice(0, 3));
      }
    }
  }, [data]);

  return (
    <div className="space-y-4">
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-primary">
            {companyName || 'Price Chart'}
          </h2>
          <p className="text-xs text-white mt-1" style={{ color: '#FFFFFF' }}>
              Real-time candlestick chart
          </p>
        </div>
        <div className="text-right">
          <div className="price-container-clean rounded-lg px-4 py-3">
            <p className="text-xs text-white mb-1" style={{ color: '#FFFFFF' }}>Current Price</p>
            <div className="flex items-center justify-end gap-3 mb-2">
              <p className="text-3xl font-bold text-primary font-mono tracking-tight">
                {formatCurrency(currentPrice)}
              </p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs accent-green font-medium">LIVE</span>
              </div>
            </div>
            {/* Net Change and Percentage Change */}
            <div className="flex items-center justify-end gap-4">
              <div className="text-right">
                <p className={`text-sm font-bold font-mono ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                  {isPositive ? '+' : ''}{formatCurrency(netChange)}
                </p>
                <p className="text-xs text-white" style={{ color: '#FFFFFF' }}>Net Change</p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-bold font-mono ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                  {isPositive ? '+' : ''}{percentageChange.toFixed(2)}%
                </p>
                <p className="text-xs text-white" style={{ color: '#FFFFFF' }}>% Change</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div className="p-4 rounded-xl" style={{ 
        background: 'linear-gradient(135deg, rgba(5, 5, 8, 0.95) 0%, rgba(0, 0, 0, 1) 100%)', 
        border: '1px solid #00FFC8',
        boxShadow: '0 8px 32px rgba(0, 255, 200, 0.2), 0 0 0 1px rgba(0, 255, 200, 0.1)',
        backdropFilter: 'blur(10px)',
      }}>
        <div 
          ref={chartContainerRef} 
          className="w-full"
          style={{ height: '500px', minHeight: '400px' }}
        />
      </div>

      {/* Company Information Panel */}
      <div className="space-y-4">
        {/* Key Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="rounded-lg p-3 text-center border" style={{ 
            background: 'linear-gradient(135deg, rgba(15, 15, 20, 0.95) 0%, rgba(5, 5, 8, 0.95) 100%)', 
            borderColor: '#00FFC8',
            boxShadow: '0 8px 32px rgba(0, 255, 200, 0.15), 0 0 0 1px rgba(0, 255, 200, 0.1)',
            backdropFilter: 'blur(10px)',
          }}>
            <p className="text-xs font-medium mb-1" style={{ color: '#FFFFFF' }}>Market Cap</p>
            <p className="text-lg font-bold accent-teal font-mono">$2.1T</p>
          </div>
          <div className="rounded-lg p-3 text-center border" style={{ 
            background: 'linear-gradient(135deg, rgba(15, 15, 20, 0.95) 0%, rgba(5, 5, 8, 0.95) 100%)', 
            borderColor: '#00FFC8',
            boxShadow: '0 8px 32px rgba(0, 255, 200, 0.15), 0 0 0 1px rgba(0, 255, 200, 0.1)',
            backdropFilter: 'blur(10px)',
          }}>
            <p className="text-xs font-medium mb-1" style={{ color: '#FFFFFF' }}>P/E Ratio</p>
            <p className="text-lg font-bold accent-teal font-mono">45.2</p>
          </div>
          <div className="rounded-lg p-3 text-center border" style={{ 
            background: 'linear-gradient(135deg, rgba(15, 15, 20, 0.95) 0%, rgba(5, 5, 8, 0.95) 100%)', 
            borderColor: '#00FFC8',
            boxShadow: '0 8px 32px rgba(0, 255, 200, 0.15), 0 0 0 1px rgba(0, 255, 200, 0.1)',
            backdropFilter: 'blur(10px)',
          }}>
            <p className="text-xs font-medium mb-1" style={{ color: '#FFFFFF' }}>Volume</p>
            <p className="text-lg font-bold accent-teal font-mono">45.2M</p>
          </div>
          <div className="rounded-lg p-3 text-center border" style={{ 
            background: 'linear-gradient(135deg, rgba(15, 15, 20, 0.95) 0%, rgba(5, 5, 8, 0.95) 100%)', 
            borderColor: '#00FFC8',
            boxShadow: '0 8px 32px rgba(0, 255, 200, 0.15), 0 0 0 1px rgba(0, 255, 200, 0.1)',
            backdropFilter: 'blur(10px)',
          }}>
            <p className="text-xs font-medium mb-1" style={{ color: '#FFFFFF' }}>52W High</p>
            <p className="text-lg font-bold accent-teal font-mono">{formatCurrency(currentPrice * 1.15)}</p>
          </div>
        </div>

        {/* Detailed Company Information */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Earnings Information */}
          <div className="rounded-lg p-4 border" style={{ 
            background: 'linear-gradient(135deg, rgba(15, 15, 20, 0.95) 0%, rgba(5, 5, 8, 0.95) 100%)', 
            borderColor: '#00FFC8',
            boxShadow: '0 8px 32px rgba(0, 255, 200, 0.15), 0 0 0 1px rgba(0, 255, 200, 0.1)',
            backdropFilter: 'blur(10px)',
          }}>
            <h4 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Upcoming Earnings
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-xs" style={{ color: '#FFFFFF' }}>Next Report</span>
                <span className="text-xs text-primary font-mono">Nov 19</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-white">Period</span>
                <span className="text-xs text-primary font-mono">Q3 2025</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-white">EPS Estimate</span>
                <span className="text-xs text-primary font-mono">$1.24</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-white">Revenue Est.</span>
                <span className="text-xs text-primary font-mono">$54.45B</span>
              </div>
            </div>
          </div>

          {/* Key Financials */}
          <div className="rounded-lg p-4 border" style={{ 
            background: 'linear-gradient(135deg, rgba(15, 15, 20, 0.95) 0%, rgba(5, 5, 8, 0.95) 100%)', 
            borderColor: '#00FFC8',
            boxShadow: '0 8px 32px rgba(0, 255, 200, 0.15), 0 0 0 1px rgba(0, 255, 200, 0.1)',
            backdropFilter: 'blur(10px)',
          }}>
            <h4 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Key Stats
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-xs text-white">Net Income (FY)</span>
                <span className="text-xs text-primary font-mono">$72.88B</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-white">Revenue (FY)</span>
                <span className="text-xs text-primary font-mono">$130.50B</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-white">Dividend Yield</span>
                <span className="text-xs text-primary font-mono">0.02%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-white">Beta (1Y)</span>
                <span className="text-xs text-primary font-mono">1.97</span>
              </div>
            </div>
          </div>

          {/* Company Details */}
          <div className="rounded-lg p-4 border" style={{ 
            background: 'linear-gradient(135deg, rgba(15, 15, 20, 0.95) 0%, rgba(5, 5, 8, 0.95) 100%)', 
            borderColor: '#00FFC8',
            boxShadow: '0 8px 32px rgba(0, 255, 200, 0.15), 0 0 0 1px rgba(0, 255, 200, 0.1)',
            backdropFilter: 'blur(10px)',
          }}>
            <h4 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Company Info
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-xs text-white">Employees</span>
                <span className="text-xs text-primary font-mono">36K</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-white">Change (1Y)</span>
                <span className="text-xs text-green-400 font-mono">+6.4K (+21.62%)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-white">Rev/Employee</span>
                <span className="text-xs text-primary font-mono">$3.62M</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-white">Net Inc/Employee</span>
                <span className="text-xs text-primary font-mono">$2.02M</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
