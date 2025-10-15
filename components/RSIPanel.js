import React, { useEffect, useState } from 'react';

import TechnicalIndicators from '../lib/technical-indicators';

import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const RSIPanel = ({ data, selectedCompany }) => {
  const [rsiData, setRsiData] = useState([]);
  const [currentRSI, setCurrentRSI] = useState(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const prices = data.map(d => d.close);
    const timestamps = data.map(d => d.time);
    const rsi = TechnicalIndicators.calculateRSI(prices, 14);

    const rsiChartData = rsi.map((value, index) => ({
      time: timestamps[index + 13] || timestamps[timestamps.length - 1],
      value: value,
    }));

    setRsiData(rsiChartData);
    setCurrentRSI(rsi[rsi.length - 1] || null);
  }, [data]);

  const getRSIStatus = (rsi) => {
    if (!rsi) return { status: 'neutral', color: '#E0E0E0' };
    
    if (rsi > 70) return { status: 'Overbought', color: '#ef4444' };
    if (rsi < 30) return { status: 'Oversold', color: '#22c55e' };
    return { status: 'Neutral', color: '#E0E0E0' };
  };

  const rsiStatus = getRSIStatus(currentRSI);

  return (
    <Card className="console-rsi-panel rounded-xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold text-white flex items-center gap-3">
          <svg className="w-5 h-5 accent-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span className="text-white">RSI (14)</span>
        </CardTitle>
        <div className="w-full h-px bg-gray-600 mt-3"></div>
      </CardHeader>
      <CardContent>
        {currentRSI ? (
          <div className="space-y-4">
            {/* Current RSI Value */}
            <div className="text-center">
              <div className="text-3xl font-bold" style={{ color: rsiStatus.color }}>
                {currentRSI.toFixed(2)}
              </div>
              <div className="text-sm text-gray-400 mt-1">
                {rsiStatus.status}
              </div>
            </div>

            {/* RSI Zones */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Overbought (70+)</span>
                <div className="w-16 h-2 bg-red-500/20 rounded-full">
                  <div 
                    className="h-full bg-red-500 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (currentRSI - 70) * 3.33)}%` }}
                  />
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Neutral (30-70)</span>
                <div className="w-16 h-2 bg-gray-500/20 rounded-full">
                  <div 
                    className="h-full bg-gray-500 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.max(0, Math.min(100, (currentRSI - 30) * 2.5))}%`,
                      marginLeft: currentRSI < 30 ? '0%' : '0%',
                    }}
                  />
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Oversold (30-)</span>
                <div className="w-16 h-2 bg-green-500/20 rounded-full">
                  <div 
                    className="h-full bg-green-500 rounded-full transition-all duration-300"
                    style={{ width: `${Math.max(0, (30 - currentRSI) * 3.33)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* RSI Chart Placeholder */}
            <div className="mt-4">
              <div className="text-sm text-gray-400 mb-2">RSI Chart</div>
              <div className="h-32 bg-gray-800/50 rounded-lg p-2 flex items-end justify-between">
                {rsiData.slice(-10).map((point, index) => {
                  const height = (point.value / 100) * 100;
                  const isOverbought = point.value > 70;
                  const isOversold = point.value < 30;
                  const isNeutral = point.value >= 30 && point.value <= 70;
                  
                  return (
                    <div
                      key={index}
                      className="flex-1 mx-0.5 rounded-t"
                      style={{
                        height: `${height}%`,
                        backgroundColor: isOverbought ? '#ef4444' : isOversold ? '#22c55e' : '#8B5CF6',
                        minHeight: '2px',
                      }}
                    />
                  );
                })}
              </div>
              
              {/* RSI Levels */}
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0</span>
                <span>30</span>
                <span>50</span>
                <span>70</span>
                <span>100</span>
              </div>
            </div>

            {/* RSI Interpretation */}
            <div className="mt-4 p-3 bg-gray-800/30 rounded-lg">
              <div className="text-sm font-medium text-white mb-2">RSI Interpretation</div>
              <div className="text-xs text-gray-400 space-y-1">
                {currentRSI > 70 && (
                  <div className="text-red-400">
                    • RSI above 70 indicates overbought conditions
                    <br />
                    • Consider potential selling opportunity
                  </div>
                )}
                {currentRSI < 30 && (
                  <div className="text-green-400">
                    • RSI below 30 indicates oversold conditions
                    <br />
                    • Consider potential buying opportunity
                  </div>
                )}
                {currentRSI >= 30 && currentRSI <= 70 && (
                  <div className="text-gray-400">
                    • RSI in neutral zone (30-70)
                    <br />
                    • No strong momentum signal
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-gray-400 text-sm">Calculating RSI...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RSIPanel;
