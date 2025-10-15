import React from 'react';

import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const MarketDepth = ({ orderBookData, isCompactView = false }) => {
  if (!orderBookData) {
    if (isCompactView) {
      return (
        <div className="space-y-3">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Market Depth</h2>
            <p className="text-sm text-gray-400">Live order book data</p>
          </div>
          <div className="text-center py-8">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-gray-400 text-sm">No market data available</p>
            <p className="text-xs text-gray-500 mt-1">Select a company to view order book</p>
          </div>
        </div>
      );
    }
    
    return (
      <Card className="console-market-depth rounded-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold text-white flex items-center gap-3">
            <svg className="w-5 h-5 accent-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-white">Market Depth</span>
          </CardTitle>
          <div className="w-full h-px bg-gray-600 mt-3"></div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-gray-400 text-sm">No market data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  const { bids, asks, bestBid, bestAsk, spread, midPrice } = orderBookData;

  // Compact view for bottom panel
  if (isCompactView) {
    return (
      <div className="space-y-3">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Market Depth</h2>
          <p className="text-sm text-gray-400">Live order book data</p>
        </div>

        {/* Key Metrics - Most Prominent */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center p-3 bg-gray-800/50 rounded-lg border border-gray-700">
            <div className="text-xs text-gray-400 mb-1">Best Bid</div>
            <div className="text-lg font-bold text-green-400 font-mono">
              {bestBid ? formatCurrency(bestBid.price) : 'N/A'}
            </div>
            <div className="text-xs text-green-300">
              {bestBid ? formatNumber(bestBid.quantity) : '0'}
            </div>
          </div>
          <div className="text-center p-3 bg-gray-800/50 rounded-lg border border-gray-700">
            <div className="text-xs text-gray-400 mb-1">Spread</div>
            <div className="text-lg font-bold text-white font-mono">
              {formatCurrency(spread)}
            </div>
            <div className="text-xs text-gray-300">
              {((spread / midPrice) * 100).toFixed(3)}%
            </div>
          </div>
          <div className="text-center p-3 bg-gray-800/50 rounded-lg border border-gray-700">
            <div className="text-xs text-gray-400 mb-1">Best Ask</div>
            <div className="text-lg font-bold text-red-400 font-mono">
              {bestAsk ? formatCurrency(bestAsk.price) : 'N/A'}
            </div>
            <div className="text-xs text-red-300">
              {bestAsk ? formatNumber(bestAsk.quantity) : '0'}
            </div>
          </div>
        </div>

        {/* Compact Order Book */}
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
          <div className="text-sm font-semibold text-cyan-400 mb-2">Order Book</div>
          <div className="grid grid-cols-3 gap-2 text-xs font-semibold text-gray-400 pb-2 border-b border-gray-600">
            <div className="text-center">Bid Qty</div>
            <div className="text-center">Price</div>
            <div className="text-center">Ask Qty</div>
          </div>
          <div className="max-h-32 overflow-y-auto space-y-1 mt-2">
            {Array.from({ length: Math.min(5, Math.max(bids.length, asks.length)) }, (_, index) => {
              const bid = bids[index];
              const ask = asks[index];
              
              return (
                <div key={index} className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-right text-green-400 font-mono">
                    {bid ? formatNumber(bid.quantity) : '-'}
                  </div>
                  <div className="text-center text-gray-400 font-mono">
                    {bid && ask ? formatCurrency((bid.price + ask.price) / 2) : '-'}
                  </div>
                  <div className="text-left text-red-400 font-mono">
                    {ask ? formatNumber(ask.quantity) : '-'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Volume Summary */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="text-center p-2 bg-gray-800/30 rounded border border-gray-700">
            <div className="text-gray-400">Total Bid Volume</div>
            <div className="text-cyan-400 font-bold">
              {formatNumber(bids.reduce((sum, bid) => sum + bid.quantity, 0))}
            </div>
          </div>
          <div className="text-center p-2 bg-gray-800/30 rounded border border-gray-700">
            <div className="text-gray-400">Total Ask Volume</div>
            <div className="text-cyan-400 font-bold">
              {formatNumber(asks.reduce((sum, ask) => sum + ask.quantity, 0))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="console-market-depth rounded-xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold text-white flex items-center gap-3">
          <svg className="w-5 h-5 accent-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span className="text-white">Market Depth</span>
        </CardTitle>
        <div className="w-full h-px bg-gray-600 mt-3"></div>
      </CardHeader>
      <CardContent>
        {/* Market Summary */}
        <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: 'rgba(0, 255, 200, 0.1)' }}>
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <p className="text-cyan-300 text-xs mb-1">Best Bid</p>
              <p className="text-green-400 font-bold text-base">
                {bestBid ? formatCurrency(bestBid.price) : 'N/A'}
              </p>
              <p className="text-green-300 text-xs">
                {bestBid ? formatNumber(bestBid.quantity) : '0'}
              </p>
            </div>
            <div>
              <p className="text-cyan-300 text-xs mb-1">Spread</p>
              <p className="text-white font-bold text-base">
                {formatCurrency(spread)}
              </p>
              <p className="text-gray-300 text-xs">
                {((spread / midPrice) * 100).toFixed(3)}%
              </p>
            </div>
            <div>
              <p className="text-cyan-300 text-xs mb-1">Best Ask</p>
              <p className="text-red-400 font-bold text-base">
                {bestAsk ? formatCurrency(bestAsk.price) : 'N/A'}
              </p>
              <p className="text-red-300 text-xs">
                {bestAsk ? formatNumber(bestAsk.quantity) : '0'}
              </p>
            </div>
          </div>
        </div>

        {/* Order Book Table */}
        <div className="space-y-1">
          {/* Header */}
          <div className="grid grid-cols-3 gap-4 text-xs font-semibold text-gray-400 pb-2 border-b border-gray-600">
            <div className="text-center">Bid Qty</div>
            <div className="text-center">Price</div>
            <div className="text-center">Ask Qty</div>
          </div>

          {/* Order Book Levels */}
          <div className="max-h-64 overflow-y-auto space-y-1">
            {Array.from({ length: Math.max(bids.length, asks.length) }, (_, index) => {
              const bid = bids[index];
              const ask = asks[index];
              
              return (
                <div key={index} className="grid grid-cols-3 gap-4 text-xs">
                  {/* Bid Side */}
                  <div className={`text-right p-1 rounded ${
                    bid && bestBid && bid.price === bestBid.price 
                      ? 'bg-green-900/30 border border-green-500/50' 
                      : 'hover:bg-gray-800/30'
                  }`}>
                    {bid ? (
                      <>
                        <div className="text-green-400 font-mono">
                          {formatNumber(bid.quantity)}
                        </div>
                        <div className="text-green-300 text-xs">
                          {formatCurrency(bid.price)}
                        </div>
                      </>
                    ) : (
                      <div className="text-gray-600">-</div>
                    )}
                  </div>

                  {/* Price Column (for visual separation) */}
                  <div className="text-center p-1">
                    {bid && ask && (
                      <div className="text-gray-500 text-xs">
                        {formatCurrency((bid.price + ask.price) / 2)}
                      </div>
                    )}
                  </div>

                  {/* Ask Side */}
                  <div className={`text-left p-1 rounded ${
                    ask && bestAsk && ask.price === bestAsk.price 
                      ? 'bg-red-900/30 border border-red-500/50' 
                      : 'hover:bg-gray-800/30'
                  }`}>
                    {ask ? (
                      <>
                        <div className="text-red-400 font-mono">
                          {formatNumber(ask.quantity)}
                        </div>
                        <div className="text-red-300 text-xs">
                          {formatCurrency(ask.price)}
                        </div>
                      </>
                    ) : (
                      <div className="text-gray-600">-</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Market Stats */}
        <div className="mt-4 pt-3 border-t border-gray-600">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="text-center p-2 rounded-lg" style={{ backgroundColor: 'rgba(0, 255, 200, 0.1)' }}>
              <p className="text-cyan-300 mb-1">Total Bid Volume</p>
              <p className="text-white font-bold">
                {formatNumber(bids.reduce((sum, bid) => sum + bid.quantity, 0))}
              </p>
            </div>
            <div className="text-center p-2 rounded-lg" style={{ backgroundColor: 'rgba(0, 255, 200, 0.1)' }}>
              <p className="text-cyan-300 mb-1">Total Ask Volume</p>
              <p className="text-white font-bold">
                {formatNumber(asks.reduce((sum, ask) => sum + ask.quantity, 0))}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketDepth;
