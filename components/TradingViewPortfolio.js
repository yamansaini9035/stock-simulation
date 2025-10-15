import { useState } from 'react';

import { formatCurrency } from '../lib/utils';

import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export default function TradingViewPortfolio({ 
  cash, 
  holdings, 
  companies,
  selectedCompany,
  currentPrice, 
  totalValue, 
  tradesCount,
  onBuy,
  onSell,
  isSessionActive, 
}) {
  const [quantity, setQuantity] = useState(1);
  const [orderType, setOrderType] = useState('market');
  const [limitPrice, setLimitPrice] = useState(0);
  
  const handleQuantityChange = (newQuantity) => {
    const clampedQuantity = Math.max(1, Math.min(100, newQuantity));
    setQuantity(clampedQuantity);
  };
  
  const handleDecreaseQuantity = () => {
    handleQuantityChange(quantity - 1);
  };
  
  const handleIncreaseQuantity = () => {
    handleQuantityChange(quantity + 1);
  };
  
  const handleBuyWithQuantity = () => {
    onBuy(quantity);
  };
  
  const handleSellWithQuantity = () => {
    onSell(quantity);
  };
  
  // Calculate order cost
  const orderPrice = orderType === 'market' ? currentPrice : limitPrice;
  const totalCost = quantity * orderPrice;
  const canAfford = cash >= totalCost;
  
  // Normalize holdings shape: API returns array [{symbol, quantity, avgPrice}],
  // older UI may provide map. Support both.
  let holdingsMap = {};
  if (Array.isArray(holdings)) {
    for (const h of holdings) {
      holdingsMap[h.symbol] = { quantity: h.quantity, averagePrice: h.avgPrice ?? h.averagePrice ?? 0 };
    }
  } else if (holdings && typeof holdings === 'object') {
    holdingsMap = holdings;
  }

  const selectedCompanyHoldings = holdingsMap[selectedCompany?.symbol] || { quantity: 0, averagePrice: 0 };
  const selectedCompanyValue = selectedCompanyHoldings.quantity * currentPrice;
  const selectedCompanyPnL = selectedCompanyHoldings.quantity * (currentPrice - selectedCompanyHoldings.averagePrice);

  // Calculate total holdings value across all companies
  const totalHoldingsValue = Object.keys(holdingsMap).reduce((total, symbol) => {
    const company = companies.find(c => c.symbol === symbol);
    if (company) {
      const companyData = holdingsMap[symbol];
      const currentPrice = company.currentPrice || company.startPrice;
      return total + (companyData.quantity * currentPrice);
    }
    return total;
  }, 0);

  const totalUnrealizedPnL = Object.keys(holdingsMap).reduce((total, symbol) => {
    const company = companies.find(c => c.symbol === symbol);
    if (company) {
      const companyData = holdingsMap[symbol];
      const currentPrice = company.currentPrice || company.startPrice;
      return total + (companyData.quantity * (currentPrice - companyData.averagePrice));
    }
    return total;
  }, 0);

  const totalPnLPercentage = totalValue > 0 ? ((totalValue - 10000) / 10000) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Portfolio Summary */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h3 className="text-sm font-medium text-gray-300 mb-4">Portfolio Summary</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-xs text-gray-400">Cash</span>
            <span className="text-sm font-medium text-white">{formatCurrency(cash)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-gray-400">Holdings</span>
            <span className="text-sm font-medium text-white">{formatCurrency(totalHoldingsValue)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-gray-400">Total Value</span>
            <span className="text-sm font-medium text-white">{formatCurrency(totalValue)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-gray-400">Total P&L</span>
            <span className={`text-xs font-medium ${totalUnrealizedPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {totalUnrealizedPnL >= 0 ? '+' : ''}{formatCurrency(totalUnrealizedPnL)} ({totalPnLPercentage >= 0 ? '+' : ''}{totalPnLPercentage.toFixed(2)}%)
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-gray-400">Trades Executed</span>
            <span className="text-xs font-medium text-white">{tradesCount}</span>
          </div>
        </div>
      </div>

      {/* Trading Controls */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h3 className="text-sm font-medium text-gray-300 mb-4">Trade {selectedCompany?.symbol || 'Select Symbol'}</h3>
        <div className="space-y-4">
          {/* Order Type Selection */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-400">Order Type</label>
            <div className="flex space-x-2">
              <button
                onClick={() => setOrderType('market')}
                className={`py-2 px-3 rounded-md text-xs font-medium transition-all duration-200 ${
                  orderType === 'market' 
                    ? 'bg-teal-600 text-white border border-teal-500' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                }`}
              >
                Market
              </button>
              <button
                onClick={() => setOrderType('limit')}
                className={`py-2 px-3 rounded-md text-xs font-medium transition-all duration-200 ${
                  orderType === 'limit' 
                    ? 'bg-teal-600 text-white border border-teal-500' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                }`}
              >
                Limit
              </button>
            </div>
          </div>

          {/* Target Price Input (when limit/stop/take-profit order selected) */}
          {(orderType === 'limit' || orderType === 'stop-loss' || orderType === 'take-profit') && (
            <div className="space-y-2">
              <label className="text-sm font-medium" style={{ color: '#E0E0E0' }}>
                {orderType === 'limit' ? 'Limit Price' : 
                  orderType === 'stop-loss' ? 'Stop Price' : 'Take-Profit Price'}
              </label>
              <input
                type="number"
                value={limitPrice}
                onChange={(e) => setLimitPrice(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white text-center font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
                placeholder={`Enter ${orderType === 'limit' ? 'limit' : orderType === 'stop-loss' ? 'stop' : 'take-profit'} price`}
              />
            </div>
          )}

          {/* Quantity Input */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-400">Quantity</label>
            <div className="flex items-center gap-2 p-1 rounded-md border border-gray-600 bg-gray-700">
              <button 
                onClick={handleDecreaseQuantity}
                disabled={quantity <= 1}
                className="w-6 h-6 rounded bg-gray-600 hover:bg-gray-500 flex items-center justify-center text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed" 
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <input
                type="number"
                min="1"
                max="100"
                value={quantity}
                onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                className="flex-1 px-2 py-1 bg-transparent border-0 rounded text-white text-center text-sm font-medium focus:outline-none focus:ring-0"
              />
              <button 
                onClick={handleIncreaseQuantity}
                disabled={quantity >= 100}
                className="w-6 h-6 rounded bg-gray-600 hover:bg-gray-500 flex items-center justify-center text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed" 
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>
          </div>

          {/* Order Cost Estimation */}
          <div className="bg-gray-700 rounded-md p-3 border border-gray-600">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium text-gray-400">Order Cost</span>
              <span className="text-sm font-bold text-white">{formatCurrency(totalCost)}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-gray-300">
              <span>{quantity} × {formatCurrency(orderPrice)}</span>
              <span className={canAfford ? 'text-green-400' : 'text-red-400'}>
                {canAfford ? 'Sufficient funds' : 'Insufficient funds'}
              </span>
            </div>
          </div>

          {/* Trade Buttons */}
          <div className="flex space-x-2 mt-4">
            <button 
              onClick={handleBuyWithQuantity}
              disabled={!isSessionActive || !selectedCompany || !canAfford}
              className="flex-1 py-2 px-4 rounded-md font-medium text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-green-600 hover:bg-green-700 border border-green-500"
            >
              <div className="flex items-center justify-center gap-2">
                <span className="text-sm font-medium">+ BUY</span>
              </div>
            </button>
            
            <button 
              onClick={handleSellWithQuantity}
              disabled={!isSessionActive || !selectedCompany || selectedCompanyHoldings.quantity < quantity}
              className="flex-1 py-2 px-4 rounded-md font-medium text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-red-600 hover:bg-red-700 border border-red-500"
            >
              <div className="flex items-center justify-center gap-2">
                <span className="text-sm font-medium">× SELL</span>
              </div>
            </button>
          </div>
        </div>
        
        {!isSessionActive && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="text-sm text-red-400 font-medium">Session ended. Trading disabled.</p>
            </div>
          </div>
        )}
        
        {isSessionActive && selectedCompany && !canAfford && (
          <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="text-sm text-yellow-400 font-medium">Insufficient cash for {quantity} shares of {selectedCompany.symbol}</p>
            </div>
          </div>
        )}
      </div>

      {/* Holdings */}
      <Card className="console-holdings rounded-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold text-white flex items-center gap-3">
            <svg className="w-5 h-5 accent-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <span className="text-white">Holdings</span>
          </CardTitle>
          <div className="w-full h-px bg-gray-600 mt-3"></div>
        </CardHeader>
        <CardContent>
          {selectedCompany && selectedCompanyHoldings.quantity > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-cyan-300 mb-1">Quantity</p>
                  <p className="text-white font-semibold">{selectedCompanyHoldings.quantity}</p>
                </div>
                <div>
                  <p className="text-cyan-300 mb-1">Average Price</p>
                  <p className="text-white font-semibold">{formatCurrency(selectedCompanyHoldings.averagePrice)}</p>
                </div>
                <div>
                  <p className="text-cyan-300 mb-1">Current Price</p>
                  <p className="text-white font-semibold">{formatCurrency(currentPrice)}</p>
                </div>
                <div>
                  <p className="text-cyan-300 mb-1">Unrealized P&L</p>
                  <p className={`font-semibold ${selectedCompanyPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {selectedCompanyPnL >= 0 ? '+' : ''}{formatCurrency(selectedCompanyPnL)}
                  </p>
                </div>
              </div>
              
              <div className="text-center p-3 rounded-lg" style={{ backgroundColor: 'rgba(0, 255, 200, 0.1)' }}>
                <p className="text-sm text-cyan-300 mb-1">Position Value</p>
                <p className="text-lg font-bold text-white">{formatCurrency(selectedCompanyValue)}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <p className="text-gray-400 text-sm">No holdings in {selectedCompany?.symbol || 'selected company'}</p>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
