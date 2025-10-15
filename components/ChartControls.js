import React, { useState } from 'react';

import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const ChartControls = ({ 
  chartType, 
  onChartTypeChange, 
  indicators, 
  onIndicatorToggle,
  onResetChart, 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const chartTypes = [
    { id: 'candlestick', name: 'Candlestick', icon: '📊' },
    { id: 'line', name: 'Line', icon: '📈' },
    { id: 'volume', name: 'Volume', icon: '📊' },
  ];

  const indicatorOptions = [
    { id: 'sma', name: 'SMA (20)', description: 'Simple Moving Average' },
    { id: 'ema', name: 'EMA (12/26)', description: 'Exponential Moving Average' },
    { id: 'rsi', name: 'RSI (14)', description: 'Relative Strength Index' },
    { id: 'bb', name: 'Bollinger Bands', description: 'Price volatility bands' },
    { id: 'macd', name: 'MACD', description: 'Moving Average Convergence Divergence' },
  ];

  return (
    <Card className="console-chart-controls rounded-xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 accent-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-white">Chart Controls</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-white"
          >
            {isExpanded ? '−' : '+'}
          </Button>
        </CardTitle>
        <div className="w-full h-px bg-gray-600 mt-3"></div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Chart Type Selection */}
        <div>
          <div className="text-sm font-medium text-gray-300 mb-3">Chart Type</div>
          <div className="grid grid-cols-3 gap-2">
            {chartTypes.map((type) => (
              <Button
                key={type.id}
                variant={chartType === type.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => onChartTypeChange(type.id)}
                className={`text-xs ${
                  chartType === type.id
                    ? 'bg-cyan-500 text-white border-cyan-500'
                    : 'bg-gray-700/50 text-gray-300 border-gray-600 hover:bg-gray-600/50'
                }`}
              >
                <span className="mr-1">{type.icon}</span>
                {type.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Indicators Section */}
        {isExpanded && (
          <div>
            <div className="text-sm font-medium text-gray-300 mb-3">Technical Indicators</div>
            <div className="space-y-3">
              {indicatorOptions.map((indicator) => (
                <div key={indicator.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-sm text-white">{indicator.name}</div>
                    <div className="text-xs text-gray-400">{indicator.description}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onIndicatorToggle(indicator.id)}
                    className={`w-12 h-6 rounded-full transition-all duration-200 ${
                      indicators[indicator.id]
                        ? 'bg-cyan-500 text-white'
                        : 'bg-gray-600 text-gray-400 hover:bg-gray-500'
                    }`}
                  >
                    {indicators[indicator.id] ? 'ON' : 'OFF'}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="pt-4 border-t border-gray-700">
          <div className="text-sm font-medium text-gray-300 mb-3">Quick Actions</div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onResetChart}
              className="bg-gray-700/50 text-gray-300 border-gray-600 hover:bg-gray-600/50"
            >
              Reset Chart
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Toggle all indicators off
                indicatorOptions.forEach(indicator => {
                  if (indicators[indicator.id]) {
                    onIndicatorToggle(indicator.id);
                  }
                });
              }}
              className="bg-gray-700/50 text-gray-300 border-gray-600 hover:bg-gray-600/50"
            >
              Clear All
            </Button>
          </div>
        </div>

        {/* Active Indicators Summary */}
        <div className="pt-4 border-t border-gray-700">
          <div className="text-sm font-medium text-gray-300 mb-2">Active Indicators</div>
          <div className="flex flex-wrap gap-1">
            {Object.entries(indicators).map(([key, value]) => {
              if (!value) return null;
              const indicator = indicatorOptions.find(opt => opt.id === key);
              return (
                <span
                  key={key}
                  className="px-2 py-1 text-xs bg-cyan-500/20 text-cyan-400 rounded-full"
                >
                  {indicator?.name || key}
                </span>
              );
            })}
            {Object.values(indicators).every(v => !v) && (
              <span className="text-xs text-gray-500">No indicators active</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChartControls;
