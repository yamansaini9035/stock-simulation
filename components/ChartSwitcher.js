import { useState } from 'react';

import CandlestickChart from './CandlestickChart';
import HistogramChart from './HistogramChart';
import LineChart from './LineChart';

export default function ChartSwitcher({ data, currentPrice, companyName, isDark = true, startPrice = null }) {
  const [activeChart, setActiveChart] = useState('candlestick');

  const chartTypes = [
    {
      id: 'candlestick',
      name: 'Candlestick',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      description: 'OHLC candlestick chart',
    },
    {
      id: 'line',
      name: 'Line',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      description: 'Closing price line chart',
    },
    {
      id: 'histogram',
      name: 'Volume',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      description: 'Volume histogram chart',
    },
  ];

  const renderChart = () => {
    switch (activeChart) {
    case 'candlestick':
      return (
        <CandlestickChart 
          data={data} 
          currentPrice={currentPrice} 
          companyName={companyName} 
          isDark={isDark}
          startPrice={startPrice}
        />
      );
    case 'line':
      return (
        <LineChart 
          data={data} 
          currentPrice={currentPrice} 
          companyName={companyName} 
          isDark={isDark} 
        />
      );
    case 'histogram':
      return (
        <HistogramChart 
          data={data} 
          currentPrice={currentPrice} 
          companyName={companyName} 
          isDark={isDark} 
        />
      );
    default:
      return (
        <CandlestickChart 
          data={data} 
          currentPrice={currentPrice} 
          companyName={companyName} 
          isDark={isDark}
          startPrice={startPrice}
        />
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Chart Type Selector */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-300">Chart Type</h3>
          <div className="text-xs text-gray-400">
            {chartTypes.find(type => type.id === activeChart)?.description}
          </div>
        </div>
        
        <div className="flex space-x-2">
          {chartTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setActiveChart(type.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeChart === type.id
                  ? 'bg-teal-600 text-white border border-teal-500'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
              }`}
            >
              {type.icon}
              <span>{type.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Active Chart */}
      {renderChart()}
    </div>
  );
}
