import { createChart } from 'lightweight-charts';
import React, { useEffect, useRef, useState, useMemo, memo } from 'react';

import TechnicalIndicators from '../lib/technical-indicators';

const AdvancedChart = ({ 
  data, 
  selectedCompany, 
  chartType = 'candlestick',
  indicators = { sma: true, ema: false, rsi: false },
  onIndicatorUpdate, 
}) => {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const [indicatorData, setIndicatorData] = useState({});
  const [chartReady, setChartReady] = useState(false);
  const seriesRef = useRef([]); // Track series for proper cleanup

  // Sanitize and validate chart data
  const sanitizeChartData = (rawData) => {
    if (!rawData || !Array.isArray(rawData)) return [];
    
    return rawData
      .filter(item => item && typeof item === 'object')
      .map(item => {
        // Ensure all required fields are numbers
        const sanitized = {
          time: item.time || item.timestamp || Date.now(),
          open: typeof item.open === 'number' ? item.open : (item.price || 0),
          high: typeof item.high === 'number' ? item.high : (item.price || 0),
          low: typeof item.low === 'number' ? item.low : (item.price || 0),
          close: typeof item.close === 'number' ? item.close : (item.price || 0),
          volume: typeof item.volume === 'number' ? item.volume : 1000,
        };
        
        // Ensure high >= low and high/low >= open/close
        sanitized.high = Math.max(sanitized.high, sanitized.open, sanitized.close);
        sanitized.low = Math.min(sanitized.low, sanitized.open, sanitized.close);
        
        return sanitized;
      })
      .filter(item => 
        item.open > 0 && 
        item.high > 0 && 
        item.low > 0 && 
        item.close > 0 &&
        !isNaN(item.time),
      );
  };

  // Calculate technical indicators with useMemo for performance
  const calculatedIndicators = useMemo(() => {
    if (!data || data.length === 0) return {};

    const cleanData = sanitizeChartData(data);
    if (cleanData.length === 0) return {};

    const prices = cleanData.map(d => d.close);
    const volumes = cleanData.map(d => d.volume || 1000); // Default volume if not available
    const timestamps = cleanData.map(d => d.time);

    const calculatedIndicators = {};

    // Calculate SMA
    if (indicators.sma) {
      const sma20 = TechnicalIndicators.calculateSMA(prices, 20);
      const sma50 = TechnicalIndicators.calculateSMA(prices, 50);
      calculatedIndicators.sma20 = sma20.map((value, index) => ({
        time: timestamps[index + 19] || timestamps[timestamps.length - 1],
        value: typeof value === 'number' ? value : value?.value,
      })).filter(p => typeof p.value === 'number');
      calculatedIndicators.sma50 = sma50.map((value, index) => ({
        time: timestamps[index + 49] || timestamps[timestamps.length - 1],
        value: typeof value === 'number' ? value : value?.value,
      })).filter(p => typeof p.value === 'number');
    }

    // Calculate EMA
    if (indicators.ema) {
      const ema12 = TechnicalIndicators.calculateEMA(prices, 12);
      const ema26 = TechnicalIndicators.calculateEMA(prices, 26);
      calculatedIndicators.ema12 = ema12.map((value, index) => ({
        time: timestamps[index + 11] || timestamps[timestamps.length - 1],
        value: typeof value === 'number' ? value : value?.value,
      })).filter(p => typeof p.value === 'number');
      calculatedIndicators.ema26 = ema26.map((value, index) => ({
        time: timestamps[index + 25] || timestamps[timestamps.length - 1],
        value: typeof value === 'number' ? value : value?.value,
      })).filter(p => typeof p.value === 'number');
    }

    // Calculate RSI
    if (indicators.rsi) {
      const rsi = TechnicalIndicators.calculateRSI(data, 14);
      calculatedIndicators.rsi = rsi.filter(item => item && typeof item.value === 'number');
    }

    // Calculate Bollinger Bands
    if (indicators.bb) {
      const bb = TechnicalIndicators.calculateBollingerBands(prices, 20, 2);
      calculatedIndicators.bbUpper = bb.upper.map((value, index) => ({
        time: timestamps[index + 19] || timestamps[timestamps.length - 1],
        value: typeof value === 'number' ? value : value?.value,
      })).filter(p => typeof p.value === 'number');
      calculatedIndicators.bbMiddle = bb.middle.map((value, index) => ({
        time: timestamps[index + 19] || timestamps[timestamps.length - 1],
        value: typeof value === 'number' ? value : value?.value,
      })).filter(p => typeof p.value === 'number');
      calculatedIndicators.bbLower = bb.lower.map((value, index) => ({
        time: timestamps[index + 19] || timestamps[timestamps.length - 1],
        value: typeof value === 'number' ? value : value?.value,
      })).filter(p => typeof p.value === 'number');
    }

    // Calculate MACD
    if (indicators.macd) {
      const macd = TechnicalIndicators.calculateMACD(data, 12, 26, 9);
      calculatedIndicators.macd = macd.macd.filter(item => item && typeof item.value === 'number');
      calculatedIndicators.signal = macd.signal.filter(item => item && typeof item.value === 'number');
      calculatedIndicators.histogram = macd.histogram.filter(item => item && typeof item.value === 'number');
    }

    return calculatedIndicators;
  }, [data, indicators.sma, indicators.ema, indicators.rsi, indicators.bb, indicators.macd, indicators.vwap, indicators.obv]);

  // Update indicator data when calculated indicators change
  useEffect(() => {
    setIndicatorData(calculatedIndicators);
    if (onIndicatorUpdate) {
      onIndicatorUpdate(calculatedIndicators);
    }
  }, [calculatedIndicators, onIndicatorUpdate]);

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight || 600,
      layout: {
        background: { color: '#111827' },
        textColor: '#E5E7EB',
        fontSize: 12,
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { visible: false },
      },
      rightPriceScale: {
        borderColor: '#374151',
        textColor: '#9CA3AF',
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      timeScale: {
        borderColor: '#374151',
        textColor: '#9CA3AF',
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 10,
        rightBarStaysOnScroll: true,
      },
      crosshair: {
        mode: 1,
      },
      watermark: {
        visible: false,
        color: 'transparent',
        text: '',
      },
    });

    chartRef.current = chart;
    
    // Set chart as ready after initialization
    setChartReady(true);

    return () => {
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
        setChartReady(false);
      }
    };
  }, []);

  // Update chart with data
  useEffect(() => {
    console.log('🔍 AdvancedChart useEffect triggered:');
    console.log('- chartRef.current:', !!chartRef.current);
    console.log('- chartReady:', chartReady);
    console.log('- chartType:', chartType);
    console.log('- data length:', data?.length || 0);
    console.log('- data sample:', data?.slice(0, 2));
    
    if (!chartRef.current || !chartReady || !data || data.length === 0) {
      console.log('❌ Chart not ready or no data');
      return;
    }

    // Sanitize the data before using it
    const cleanData = sanitizeChartData(data);
    console.log('🔍 Clean data length:', cleanData.length);
    console.log('🔍 Clean data sample:', cleanData.slice(0, 2));
    console.log('🔍 OHLC validation:', cleanData.slice(0, 2).map(d => ({
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
      valid: d.high >= d.low && d.high >= Math.max(d.open, d.close) && d.low <= Math.min(d.open, d.close),
    })));
    
    if (cleanData.length === 0) {
      console.warn('No valid data available for chart');
      return;
    }

    // Clear existing series safely
    try {
      seriesRef.current.forEach(series => {
        if (series && chartRef.current) {
          chartRef.current.removeSeries(series);
        }
      });
      seriesRef.current = []; // Reset series tracking
    } catch (error) {
      console.warn('Error removing series:', error);
    }

    let mainSeries;

    // Create main series based on chart type
    if (chartType === 'candlestick') {
      console.log('🔍 Creating candlestick series with data:', cleanData.length, 'points');
      console.log('🔍 Sample candlestick data:', cleanData.slice(0, 2));
      
      mainSeries = chartRef.current.addCandlestickSeries({
        upColor: '#10B981',
        downColor: '#EF4444',
        borderUpColor: '#10B981',
        borderDownColor: '#EF4444',
        wickUpColor: '#10B981',
        wickDownColor: '#EF4444',
      });
      
      console.log('🔍 Candlestick series created:', !!mainSeries);
      
      try {
        mainSeries.setData(cleanData);
        console.log('✅ Candlestick data set successfully');
      } catch (error) {
        console.error('❌ Error setting candlestick data:', error);
        console.log('❌ Problematic data sample:', cleanData.slice(0, 3));
        return;
      }
    } else if (chartType === 'line') {
      const lineData = cleanData.map(d => ({ time: d.time, value: d.close }));
      mainSeries = chartRef.current.addAreaSeries({
        lineColor: '#00FFFF',
        topColor: 'rgba(0, 255, 255, 0.56)',
        bottomColor: 'rgba(0, 255, 255, 0.04)',
        lineWidth: 2,
        crosshairMarkerVisible: true,
        crosshairMarkerRadius: 6,
        crosshairMarkerBorderColor: '#00FFFF',
        crosshairMarkerBackgroundColor: '#ffffff',
      });
      try {
        mainSeries.setData(lineData);
      } catch (error) {
        console.error('Error setting line data:', error);
        return;
      }
    } else if (chartType === 'volume') {
      const volumeData = cleanData.map(d => ({ time: d.time, value: d.volume || 1000 }));
      mainSeries = chartRef.current.addHistogramSeries({
        color: '#8B5CF6',
        priceFormat: {
          type: 'volume',
        },
        priceScaleId: 'volume',
      });
      try {
        mainSeries.setData(volumeData);
      } catch (error) {
        console.error('Error setting volume data:', error);
        return;
      }
    }

    // Track the main series
    if (mainSeries) {
      seriesRef.current.push(mainSeries);
    }

    // Add indicator series
    if (indicatorData.sma20) {
      const sma20Series = chartRef.current.addLineSeries({
        color: TechnicalIndicators.getIndicatorColor('SMA'),
        lineWidth: 1,
        title: 'SMA 20',
      });
      sma20Series.setData(indicatorData.sma20);
      seriesRef.current.push(sma20Series);
    }

    if (indicatorData.sma50) {
      const sma50Series = chartRef.current.addLineSeries({
        color: '#FFA500',
        lineWidth: 1,
        title: 'SMA 50',
      });
      sma50Series.setData(indicatorData.sma50);
      seriesRef.current.push(sma50Series);
    }

    if (indicatorData.ema12) {
      const ema12Series = chartRef.current.addLineSeries({
        color: TechnicalIndicators.getIndicatorColor('EMA'),
        lineWidth: 1,
        title: 'EMA 12',
      });
      ema12Series.setData(indicatorData.ema12);
      seriesRef.current.push(ema12Series);
    }

    if (indicatorData.ema26) {
      const ema26Series = chartRef.current.addLineSeries({
        color: '#00BFFF',
        lineWidth: 1,
        title: 'EMA 26',
      });
      ema26Series.setData(indicatorData.ema26);
      seriesRef.current.push(ema26Series);
    }

    if (indicatorData.bbUpper) {
      const bbUpperSeries = chartRef.current.addLineSeries({
        color: TechnicalIndicators.getIndicatorColor('BollingerUpper'),
        lineWidth: 1,
        title: 'BB Upper',
      });
      bbUpperSeries.setData(indicatorData.bbUpper);
      seriesRef.current.push(bbUpperSeries);

      const bbMiddleSeries = chartRef.current.addLineSeries({
        color: TechnicalIndicators.getIndicatorColor('BollingerMiddle'),
        lineWidth: 1,
        title: 'BB Middle',
      });
      bbMiddleSeries.setData(indicatorData.bbMiddle);
      seriesRef.current.push(bbMiddleSeries);

      const bbLowerSeries = chartRef.current.addLineSeries({
        color: TechnicalIndicators.getIndicatorColor('BollingerLower'),
        lineWidth: 1,
        title: 'BB Lower',
      });
      bbLowerSeries.setData(indicatorData.bbLower);
      seriesRef.current.push(bbLowerSeries);
    }

    // Add RSI indicator (on separate scale)
    if (indicatorData.rsi) {
      const rsiSeries = chartRef.current.addLineSeries({
        color: TechnicalIndicators.getIndicatorColor('RSI'),
        lineWidth: 2,
        title: 'RSI (14)',
        priceScaleId: 'rsi',
      });
      rsiSeries.setData(indicatorData.rsi);
      seriesRef.current.push(rsiSeries);

      // Configure RSI price scale
      chartRef.current.priceScale('rsi').applyOptions({
        scaleMargins: {
          top: 0.8,
          bottom: 0,
        },
        borderVisible: false,
      });
    }

    // Add MACD indicator (on separate scale)
    if (indicatorData.macd) {
      const macdSeries = chartRef.current.addLineSeries({
        color: TechnicalIndicators.getIndicatorColor('MACD'),
        lineWidth: 2,
        title: 'MACD',
        priceScaleId: 'macd',
      });
      macdSeries.setData(indicatorData.macd);
      seriesRef.current.push(macdSeries);

      if (indicatorData.signal) {
        const signalSeries = chartRef.current.addLineSeries({
          color: TechnicalIndicators.getIndicatorColor('MACDSignal'),
          lineWidth: 2,
          title: 'MACD Signal',
          priceScaleId: 'macd',
        });
        signalSeries.setData(indicatorData.signal);
        seriesRef.current.push(signalSeries);
      }

      if (indicatorData.histogram) {
        const histogramSeries = chartRef.current.addHistogramSeries({
          color: TechnicalIndicators.getIndicatorColor('MACDHistogram'),
          title: 'MACD Histogram',
          priceScaleId: 'macd',
        });
        histogramSeries.setData(indicatorData.histogram);
        seriesRef.current.push(histogramSeries);
      }

      // Configure MACD price scale
      chartRef.current.priceScale('macd').applyOptions({
        scaleMargins: {
          top: 0.85,
          bottom: 0,
        },
        borderVisible: false,
      });
    }

    // Fit content to show all data
    chartRef.current.timeScale().fitContent();

  }, [data, chartType, indicatorData, chartReady]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (chartRef.current && chartContainerRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight || 600,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="w-full h-full">
      <div 
        ref={chartContainerRef} 
        className="w-full h-full rounded-lg"
        style={{ height: '100%', minHeight: '400px' }}
      />
      {/* Debug overlay removed for production */}
    </div>
  );
};

export default memo(AdvancedChart);
