import { createChart, HistogramSeries } from 'lightweight-charts';
import { useEffect, useRef } from 'react';

import { formatCurrency } from '../lib/utils';

export default function HistogramChart({ data, currentPrice, companyName, isDark = true }) {
  const chartContainerRef = useRef();
  const chartRef = useRef();
  const histogramSeriesRef = useRef();

  // Convert tick data to histogram data
  const generateHistogramData = (tickData) => {
    if (!tickData || tickData.length === 0) return [];
    
    const histogramData = [];
    
    for (let i = 0; i < tickData.length; i++) {
      const current = tickData[i];
      const previous = i > 0 ? tickData[i - 1] : current;
      
      // Generate volume based on price movement
      const priceChange = current.price - previous.price;
      const baseVolume = 50000;
      const priceChangePercent = Math.abs(priceChange) / previous.price;
      const volumeMultiplier = 1 + (priceChangePercent * 3);
      const volume = Math.floor(baseVolume * volumeMultiplier * (0.7 + Math.random() * 0.6));
      
      // Create proper timestamp for each tick (7 seconds apart)
      const baseTime = new Date('2024-01-01T09:00:00').getTime() / 1000; // Start at 9 AM
      const timeValue = baseTime + (i * 7); // Each tick is 7 seconds apart
      
      histogramData.push({
        time: timeValue,
        value: volume,
        color: priceChange >= 0 ? '#22c55e' : '#ef4444',
      });
    }
    
    return histogramData;
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

    // Add histogram series
    const histogramSeries = chart.addSeries(HistogramSeries, {
      color: '#00E676',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '',
      scaleMargins: {
        top: 0.1,
        bottom: 0.1,
      },
    });
    histogramSeriesRef.current = histogramSeries;

    // Generate and set data
    const histogramData = generateHistogramData(data);
    
    // Validate data before setting
    if (histogramData.length > 0 && histogramData[0].time !== undefined && !isNaN(histogramData[0].time)) {
      histogramSeries.setData(histogramData);
    } else {
      console.error('Invalid histogram data:', histogramData.slice(0, 3));
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
    if (histogramSeriesRef.current && data && data.length > 0) {
      const histogramData = generateHistogramData(data);
      
      // Validate data before setting
      if (histogramData.length > 0 && histogramData[0].time !== undefined && !isNaN(histogramData[0].time)) {
        histogramSeriesRef.current.setData(histogramData);
      } else {
        console.error('Invalid histogram data in update:', histogramData.slice(0, 3));
      }
    }
  }, [data]);

  // Calculate volume statistics
  const volumeStats = data.length > 0 ? {
    total: data.reduce((sum, _, i) => {
      const current = data[i];
      const previous = i > 0 ? data[i - 1] : current;
      const priceChange = current.price - previous.price;
      const baseVolume = 50000;
      const priceChangePercent = Math.abs(priceChange) / previous.price;
      const volumeMultiplier = 1 + (priceChangePercent * 3);
      return sum + Math.floor(baseVolume * volumeMultiplier * (0.7 + Math.random() * 0.6));
    }, 0),
    average: 0,
    max: 0,
  } : { total: 0, average: 0, max: 0 };

  if (data.length > 0) {
    volumeStats.average = Math.floor(volumeStats.total / data.length);
    volumeStats.max = Math.floor(volumeStats.total * 1.2); // Approximate max
  }

  return (
    <div className="space-y-4">
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white stock-title-glow">
            {companyName || 'Volume Chart'} - Histogram
          </h2>
          <p className="text-xs text-white mt-1">
            Trading volume over time
          </p>
        </div>
        <div className="text-right">
          <div className="bg-gray-800/50 rounded-lg px-4 py-3 price-container-glow">
            <p className="text-xs text-white mb-1">Current Price</p>
            <p className="text-3xl font-bold text-white font-mono tracking-tight portfolio-value">
              {formatCurrency(currentPrice)}
            </p>
            <div className="flex items-center justify-end mt-1">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-2 animate-pulse"></div>
              <span className="text-xs text-neon-purple font-medium">VOLUME</span>
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

      {/* Volume Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="rounded-lg p-3 text-center border" style={{ backgroundColor: '#14141E', borderColor: '#00FFFF' }}>
          <p className="text-xs text-white font-medium mb-1">Total Volume</p>
          <p className="text-lg font-bold accent-teal font-mono">
            {volumeStats.total.toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg p-3 text-center border" style={{ backgroundColor: '#14141E', borderColor: '#00FFFF' }}>
          <p className="text-xs text-white font-medium mb-1">Avg Volume</p>
          <p className="text-lg font-bold accent-teal font-mono">
            {volumeStats.average.toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg p-3 text-center border" style={{ backgroundColor: '#14141E', borderColor: '#00FFFF' }}>
          <p className="text-xs text-white font-medium mb-1">Peak Volume</p>
          <p className="text-lg font-bold accent-teal font-mono">
            {volumeStats.max.toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg p-3 text-center border" style={{ backgroundColor: '#14141E', borderColor: '#00FFFF' }}>
          <p className="text-xs text-white font-medium mb-1">Data Points</p>
          <p className="text-lg font-bold accent-teal font-mono">{data.length}</p>
        </div>
      </div>
    </div>
  );
}
