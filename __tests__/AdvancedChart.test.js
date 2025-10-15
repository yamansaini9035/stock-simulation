import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';

import AdvancedChart from '../components/AdvancedChart-refactored';

/**
 * REFACTORED: Comprehensive Test Suite for AdvancedChart
 * 
 * Test Coverage:
 * 1. ✅ Component rendering with valid data
 * 2. ✅ Error handling with invalid data
 * 3. ✅ Loading states
 * 4. ✅ Chart type switching
 * 5. ✅ Indicator calculations
 * 6. ✅ Data validation
 * 7. ✅ Error boundary functionality
 * 8. ✅ Performance optimization
 */

// Mock lightweight-charts
jest.mock('lightweight-charts', () => ({
  createChart: jest.fn(() => ({
    addCandlestickSeries: jest.fn(() => ({
      setData: jest.fn(),
    })),
    addLineSeries: jest.fn(() => ({
      setData: jest.fn(),
    })),
    addHistogramSeries: jest.fn(() => ({
      setData: jest.fn(),
    })),
    removeSeries: jest.fn(),
    timeScale: jest.fn(() => ({
      fitContent: jest.fn(),
    })),
    applyOptions: jest.fn(),
    remove: jest.fn(),
  })),
}));

// Mock TechnicalIndicators
jest.mock('../lib/technical-indicators', () => ({
  calculateSMA: jest.fn(() => [100, 101, 102]),
  calculateEMA: jest.fn(() => [100, 101, 102]),
  calculateRSI: jest.fn(() => [50, 51, 52]),
  calculateBollingerBands: jest.fn(() => ({
    upper: [105, 106, 107],
    middle: [100, 101, 102],
    lower: [95, 96, 97],
  })),
  calculateMACD: jest.fn(() => ({
    macd: [1, 2, 3],
    signal: [0.5, 1, 1.5],
    histogram: [0.5, 1, 1.5],
  })),
}));

describe('AdvancedChart Component', () => {
  const mockData = [
    {
      time: 1640995200,
      open: 100,
      high: 105,
      low: 95,
      close: 102,
      volume: 1000,
    },
    {
      time: 1640995800,
      open: 102,
      high: 108,
      low: 98,
      close: 106,
      volume: 1200,
    },
  ];

  const mockCompany = {
    symbol: 'TEST',
    name: 'Test Company',
    price: 100,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading state initially', () => {
    render(
      <AdvancedChart
        data={[]}
        selectedCompany={mockCompany}
        chartType="candlestick"
      />,
    );

    expect(screen.getByText('Initializing Chart...')).toBeInTheDocument();
  });

  test('renders no data state when data is empty', async () => {
    render(
      <AdvancedChart
        data={[]}
        selectedCompany={mockCompany}
        chartType="candlestick"
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('No Data Available')).toBeInTheDocument();
    });
  });

  test('renders chart with valid data', async () => {
    render(
      <AdvancedChart
        data={mockData}
        selectedCompany={mockCompany}
        chartType="candlestick"
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('TEST - CANDLESTICK')).toBeInTheDocument();
    });
  });

  test('handles invalid data gracefully', () => {
    const invalidData = [
      { time: 'invalid', open: null, high: undefined, low: 'invalid', close: 0, volume: -1 },
    ];

    render(
      <AdvancedChart
        data={invalidData}
        selectedCompany={mockCompany}
        chartType="candlestick"
      />,
    );

    // Should filter out invalid data and show no data state
    expect(screen.getByText('No Data Available')).toBeInTheDocument();
  });

  test('switches chart types correctly', async () => {
    const { rerender } = render(
      <AdvancedChart
        data={mockData}
        selectedCompany={mockCompany}
        chartType="candlestick"
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('TEST - CANDLESTICK')).toBeInTheDocument();
    });

    rerender(
      <AdvancedChart
        data={mockData}
        selectedCompany={mockCompany}
        chartType="line"
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('TEST - LINE')).toBeInTheDocument();
    });
  });

  test('calculates indicators correctly', async () => {
    const indicators = {
      sma: true,
      ema: true,
      rsi: true,
      bb: true,
    };

    render(
      <AdvancedChart
        data={mockData}
        selectedCompany={mockCompany}
        chartType="candlestick"
        indicators={indicators}
      />,
    );

    await waitFor(() => {
      // Verify that indicator calculation methods were called
      const { calculateSMA, calculateEMA, calculateRSI, calculateBollingerBands } = require('../lib/technical-indicators');
      expect(calculateSMA).toHaveBeenCalled();
      expect(calculateEMA).toHaveBeenCalled();
      expect(calculateRSI).toHaveBeenCalled();
      expect(calculateBollingerBands).toHaveBeenCalled();
    });
  });

  test('handles missing selectedCompany gracefully', () => {
    render(
      <AdvancedChart
        data={mockData}
        selectedCompany={null}
        chartType="candlestick"
      />,
    );

    expect(screen.getByText('Select a company to view chart')).toBeInTheDocument();
  });

  test('validates data structure before processing', () => {
    const malformedData = [
      { time: 1640995200 }, // Missing required fields
      { open: 100, high: 105, low: 95, close: 102 }, // Missing time
      { time: 'invalid', open: 100, high: 105, low: 95, close: 102, volume: 1000 }, // Invalid time
    ];

    render(
      <AdvancedChart
        data={malformedData}
        selectedCompany={mockCompany}
        chartType="candlestick"
      />,
    );

    // Should filter out malformed data
    expect(screen.getByText('No Data Available')).toBeInTheDocument();
  });

  test('handles chart initialization errors', async () => {
    // Mock createChart to throw an error
    const { createChart } = require('lightweight-charts');
    createChart.mockImplementation(() => {
      throw new Error('Chart initialization failed');
    });

    render(
      <AdvancedChart
        data={mockData}
        selectedCompany={mockCompany}
        chartType="candlestick"
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('Chart Error')).toBeInTheDocument();
      expect(screen.getByText('Chart initialization failed')).toBeInTheDocument();
    });
  });

  test('shows retry button on error', async () => {
    const { createChart } = require('lightweight-charts');
    createChart.mockImplementation(() => {
      throw new Error('Chart initialization failed');
    });

    render(
      <AdvancedChart
        data={mockData}
        selectedCompany={mockCompany}
        chartType="candlestick"
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });
  });

  test('handles different chart types', async () => {
    const chartTypes = ['candlestick', 'line', 'volume'];
    
    for (const chartType of chartTypes) {
      const { unmount } = render(
        <AdvancedChart
          data={mockData}
          selectedCompany={mockCompany}
          chartType={chartType}
        />,
      );

      await waitFor(() => {
        expect(screen.getByText(`TEST - ${chartType.toUpperCase()}`)).toBeInTheDocument();
      });

      unmount();
    }
  });

  test('optimizes re-renders with memoization', () => {
    const { rerender } = render(
      <AdvancedChart
        data={mockData}
        selectedCompany={mockCompany}
        chartType="candlestick"
      />,
    );

    // Re-render with same props should not cause unnecessary calculations
    rerender(
      <AdvancedChart
        data={mockData}
        selectedCompany={mockCompany}
        chartType="candlestick"
      />,
    );

    // Verify that createChart was only called once
    const { createChart } = require('lightweight-charts');
    expect(createChart).toHaveBeenCalledTimes(1);
  });
});
