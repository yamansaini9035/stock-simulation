import React, { useState, useEffect } from 'react';

const TradeHistoryTable = ({ userId, trades = [] }) => {
  const [tradeHistory, setTradeHistory] = useState([]);

  // Calculate realized P&L for trades
  const calculateRealizedPnL = (trades) => {
    const holdings = {}; // Track holdings by symbol: { symbol: { quantity, totalCost, avgPrice } }
    const tradesWithPnL = [];

    // Sort trades by creation date to process in chronological order
    const sortedTrades = [...trades].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    for (const trade of sortedTrades) {
      const { symbol, action, quantity, price } = trade;
      let realizedPnL = null;

      if (action === 'BUY') {
        // For BUY orders, update holdings but no realized P&L
        if (!holdings[symbol]) {
          holdings[symbol] = { quantity: 0, totalCost: 0, avgPrice: 0 };
        }
        holdings[symbol].quantity += quantity;
        holdings[symbol].totalCost += quantity * price;
        holdings[symbol].avgPrice = holdings[symbol].totalCost / holdings[symbol].quantity;
        realizedPnL = null; // No P&L on buy
      } else if (action === 'SELL') {
        // For SELL orders, calculate realized P&L
        if (holdings[symbol] && holdings[symbol].quantity >= quantity) {
          const avgCost = holdings[symbol].avgPrice;
          realizedPnL = quantity * (price - avgCost);
          
          // Update holdings
          holdings[symbol].quantity -= quantity;
          holdings[symbol].totalCost -= quantity * avgCost;
          
          // If no shares left, reset
          if (holdings[symbol].quantity === 0) {
            holdings[symbol] = { quantity: 0, totalCost: 0, avgPrice: 0 };
          }
        } else {
          // Shouldn't happen in normal trading, but handle gracefully
          realizedPnL = null;
        }
      }

      tradesWithPnL.push({
        ...trade,
        realizedPnL
      });
    }

    // Return trades in reverse chronological order (newest first)
    return tradesWithPnL.reverse();
  };

  useEffect(() => {
    const tradesWithPnL = calculateRealizedPnL(trades);
    setTradeHistory(tradesWithPnL);
  }, [trades]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getActionColor = (action) => {
    return action === 'BUY' ? 'text-green-400' : 'text-red-400';
  };

  const getActionBgColor = (action) => {
    return action === 'BUY' 
      ? 'bg-green-900/20 border-green-500/30' 
      : 'bg-red-900/20 border-red-500/30';
  };

  if (!tradeHistory || tradeHistory.length === 0) {
    return (
      <div className="bg-gray-900 rounded-lg p-5 border border-gray-700 flex flex-col">
        <div className="flex-1 flex flex-col">
          {/* Trade History Header */}
          <div className="flex-shrink-0 mb-3">
            <h2 className="text-2xl font-bold text-white mb-1">Trade History</h2>
            <p className="text-sm text-gray-400">(0 trades)</p>
          </div>
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-gray-400 text-sm">No trades executed yet</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg p-5 border border-gray-700 flex flex-col">
      <div className="flex-1 flex flex-col">
        {/* Trade History Header */}
        <div className="flex-shrink-0 mb-3">
          <h2 className="text-2xl font-bold text-white mb-1">Trade History</h2>
          <p className="text-sm text-gray-400">({tradeHistory.length} trades)</p>
        </div>
        {/* Trade List */}
        <div className="overflow-y-auto space-y-3 pr-2" style={{ height: '400px', scrollbarWidth: 'thin', scrollbarColor: '#4B5563 transparent' }}>
          {tradeHistory.map((trade, index) => (
            <div
              key={trade.id || index}
              className="p-3 rounded-md border border-gray-700 bg-gray-800/60 hover:bg-gray-800/80 transition-colors"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-cyan-300">{trade.symbol || 'UNKNOWN'}</span>
                <span className={`text-xs font-medium px-2 py-1 rounded ${
                  trade.action === 'BUY' 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {trade.action}
                </span>
              </div>
              <div className="text-sm text-white font-medium">{trade.action} {trade.quantity} shares at {formatCurrency(trade.price)}</div>
              {trade.realizedPnL != null && (
                <div className="text-xs text-gray-400 mt-1">P&L: {trade.realizedPnL >= 0 ? '+' : ''}{formatCurrency(trade.realizedPnL)}</div>
              )}
            </div>
          ))}
        </div>
        
        {tradeHistory.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-600">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center p-2 rounded-lg" style={{ backgroundColor: 'rgba(0, 255, 200, 0.1)' }}>
                <p className="text-cyan-300 text-xs mb-1">Total Trades</p>
                <p className="text-white font-bold">{tradeHistory.length}</p>
              </div>
              <div className="text-center p-2 rounded-lg" style={{ backgroundColor: 'rgba(0, 255, 200, 0.1)' }}>
                <p className="text-cyan-300 text-xs mb-1">Realized P&L</p>
                <p className={`font-bold ${
                  tradeHistory.reduce((sum, trade) => sum + (trade.realizedPnL || 0), 0) >= 0 
                    ? 'text-green-400' 
                    : 'text-red-400'
                }`}>
                  {formatCurrency(tradeHistory.reduce((sum, trade) => sum + (trade.realizedPnL || 0), 0))}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TradeHistoryTable;
