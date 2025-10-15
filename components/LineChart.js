import { createChart, LineSeries } from 'lightweight-charts';
import { useEffect, useRef } from 'react';

import { formatCurrency } from '../lib/utils';

export default function LineChart({ data = [], currentPrice, companyName, isDark = true }) {
  const chartContainerRef = useRef();
  const chartRef = useRef();
  const lineSeriesRef = useRef();

  // Convert tick data to line chart data
  const generateLineData = (tickData) => {
    if (!tickData || tickData.length === 0) return [];
    
    const lineData = [];
    
    for (let i = 0; i < tickData.length; i++) {
      const current = tickData[i];
      
      // Create proper timestamp for each tick (7 seconds apart)
      const baseTime = new Date('2024-01-01T09:00:00').getTime() / 1000; // Start at 9 AM
      const timeValue = baseTime + (i * 7); // Each tick is 7 seconds apart
      
      lineData.push({
        time: timeValue,
        value: Number(current.price.toFixed(2)),
      });
    }
    
    return lineData;
  };

  useEffect(() => {
    if (!chartContainerRef.current || !data || data.length === 0) return;

    // Create chart with dark theme
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
          color: '#3b82f6',
          width: 1,
          style: 2,
          labelBackgroundColor: '#1e293b',
        },
        horzLine: {
          color: '#3b82f6',
          width: 1,
          style: 2,
          labelBackgroundColor: '#1e293b',
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
        barSpacing: 8,
        minBarSpacing: 2,
        fixLeftEdge: true,
        fixRightEdge: true,
        lockVisibleTimeRangeOnResize: true,
      },
    });

    chartRef.current = chart;

    // Add area series with TradingView-style fade effect
    const lineSeries = chart.addAreaSeries({
      lineColor: '#00E676',
      topColor: 'rgba(0, 230, 118, 0.56)',
      bottomColor: 'rgba(0, 230, 118, 0.04)',
      lineWidth: 2,
      lineStyle: 0, // Solid line
      crosshairMarkerVisible: true,
      crosshairMarkerRadius: 6,
      crosshairMarkerBorderColor: '#00E676',
      crosshairMarkerBackgroundColor: '#ffffff',
    });
    lineSeriesRef.current = lineSeries;

    // Generate and set data
    const lineData = generateLineData(data);
    
    // Validate data before setting
    if (lineData.length > 0 && lineData[0].time !== undefined && !isNaN(lineData[0].time)) {
      lineSeries.setData(lineData);
    } else {
      console.error('Invalid line data:', lineData.slice(0, 3));
    }

    // ResizeObserver for responsiveness
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
    if (lineSeriesRef.current && data && data.length > 0) {
      const lineData = generateLineData(data);
      
      // Validate data before setting
      if (lineData.length > 0 && lineData[0].time !== undefined && !isNaN(lineData[0].time)) {
        lineSeriesRef.current.setData(lineData);
      } else {
        console.error('Invalid line data in update:', lineData.slice(0, 3));
      }
    }
  }, [data]);

  return (
    <div className="space-y-4">
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white stock-title-glow">
            {companyName || 'Price Chart'} - Line
          </h2>
          <p className="text-xs text-white mt-1">
            Closing price over time
          </p>
        </div>
        <div className="text-right">
          <div className="bg-gray-800/50 rounded-lg px-4 py-3 price-container-glow">
            <p className="text-xs text-white mb-1">Current Price</p>
            <p className="text-3xl font-bold text-white font-mono tracking-tight portfolio-value">
              {formatCurrency(currentPrice)}
            </p>
            <div className="flex items-center justify-end mt-1">
              <div className="w-2 h-2 bg-teal-500 rounded-full mr-2 animate-pulse"></div>
              <span className="text-xs text-neon-teal font-medium">LIVE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div className="card-tradingview p-4">
        <div 
          ref={chartContainerRef} 
          className="w-full"
          style={{ height: '500px', minHeight: '400px' }}
        />
      </div>

      {/* Chart Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="rounded-lg p-3 text-center border" style={{ backgroundColor: '#14141E', borderColor: '#00FFFF' }}>
          <p className="text-xs text-white font-medium mb-1">Data Points</p>
          <p className="text-lg font-bold accent-teal font-mono">{data?.length || 0}</p>
        </div>
        <div className="rounded-lg p-3 text-center border" style={{ backgroundColor: '#14141E', borderColor: '#00FFFF' }}>
          <p className="text-xs text-white font-medium mb-1">Min Price</p>
          <p className="text-lg font-bold accent-teal font-mono">
            {data && data.length > 0 ? formatCurrency(Math.min(...data.map(d => d.price || 0))) : '$0.00'}
          </p>
        </div>
        <div className="rounded-lg p-3 text-center border" style={{ backgroundColor: '#14141E', borderColor: '#00FFFF' }}>
          <p className="text-xs text-white font-medium mb-1">Max Price</p>
          <p className="text-lg font-bold accent-teal font-mono">
            {data && data.length > 0 ? formatCurrency(Math.max(...data.map(d => d.price || 0))) : '$0.00'}
          </p>
        </div>
        <div className="rounded-lg p-3 text-center border" style={{ backgroundColor: '#14141E', borderColor: '#00FFFF' }}>
          <p className="text-xs text-white font-medium mb-1">Range</p>
          <p className="text-lg font-bold accent-teal font-mono">
            {data && data.length > 0 ? formatCurrency(Math.max(...data.map(d => d.price || 0)) - Math.min(...data.map(d => d.price || 0))) : '$0.00'}
          </p>
        </div>
      </div>
    </div>
  );
}
