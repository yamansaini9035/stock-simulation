import React, { useState, useEffect } from 'react';

import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const SessionAnalytics = ({ 
  userData, 
  sessionStatus, 
  onRestartSession,
  isVisible = false, 
}) => {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    if (!userData || !userData.portfolio) return;

    const portfolio = userData.portfolio;
    const trades = userData.trades || [];
    
    // Calculate analytics
    const totalTrades = trades.length;
    const winningTrades = trades.filter(trade => trade.pnl > 0);
    const losingTrades = trades.filter(trade => trade.pnl < 0);
    const breakEvenTrades = trades.filter(trade => trade.pnl === 0);
    
    const winRate = totalTrades > 0 ? (winningTrades.length / totalTrades) * 100 : 0;
    const lossRate = totalTrades > 0 ? (losingTrades.length / totalTrades) * 100 : 0;
    
    const totalPnL = trades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    const bestTrade = trades.length > 0 ? Math.max(...trades.map(t => t.pnl || 0)) : 0;
    const worstTrade = trades.length > 0 ? Math.min(...trades.map(t => t.pnl || 0)) : 0;
    
    const avgWin = winningTrades.length > 0 ? 
      winningTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0) / winningTrades.length : 0;
    const avgLoss = losingTrades.length > 0 ? 
      losingTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0) / losingTrades.length : 0;
    
    const profitFactor = avgLoss !== 0 ? Math.abs(avgWin / avgLoss) : 0;
    
    // Calculate session duration
    const sessionStart = sessionStatus.startTime ? new Date(sessionStatus.startTime) : new Date();
    const sessionDuration = Math.floor((Date.now() - sessionStart.getTime()) / 1000 / 60); // minutes
    
    // Calculate volume metrics
    const totalVolume = trades.reduce((sum, trade) => sum + (trade.quantity || 0), 0);
    const avgTradeSize = totalTrades > 0 ? totalVolume / totalTrades : 0;
    
    // Calculate risk metrics
    const maxDrawdown = calculateMaxDrawdown(trades);
    const sharpeRatio = calculateSharpeRatio(trades);
    
    setAnalytics({
      totalTrades,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      breakEvenTrades: breakEvenTrades.length,
      winRate,
      lossRate,
      totalPnL,
      bestTrade,
      worstTrade,
      avgWin,
      avgLoss,
      profitFactor,
      sessionDuration,
      totalVolume,
      avgTradeSize,
      maxDrawdown,
      sharpeRatio,
      currentBalance: portfolio.balance,
      totalValue: portfolio.totalValue,
    });
  }, [userData, sessionStatus]);

  const calculateMaxDrawdown = (trades) => {
    if (trades.length === 0) return 0;
    
    let peak = 0;
    let maxDrawdown = 0;
    let runningPnL = 0;
    
    trades.forEach(trade => {
      runningPnL += trade.pnl || 0;
      if (runningPnL > peak) {
        peak = runningPnL;
      }
      const drawdown = peak - runningPnL;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    });
    
    return maxDrawdown;
  };

  const calculateSharpeRatio = (trades) => {
    if (trades.length < 2) return 0;
    
    const returns = trades.map(trade => trade.pnl || 0);
    const avgReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);
    
    return stdDev !== 0 ? avgReturn / stdDev : 0;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatPercentage = (value) => {
    return `${value.toFixed(2)}%`;
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  if (!isVisible || !analytics) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="console-session-analytics rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
            <svg className="w-6 h-6 accent-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-white">Session Analytics Report</span>
          </CardTitle>
          <div className="w-full h-px bg-gray-600 mt-3"></div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Performance Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-white">
                  {formatCurrency(analytics.totalPnL)}
                </div>
                <div className="text-sm text-gray-400">Total P&L</div>
                <div className={`text-xs mt-1 ${
                  analytics.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {analytics.totalPnL >= 0 ? '+' : ''}{formatPercentage(analytics.totalPnL / 10000 * 100)}
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-white">
                  {formatCurrency(analytics.totalValue)}
                </div>
                <div className="text-sm text-gray-400">Portfolio Value</div>
                <div className="text-xs text-gray-500 mt-1">
                  Balance: {formatCurrency(analytics.currentBalance)}
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-white">
                  {formatPercentage(analytics.winRate)}
                </div>
                <div className="text-sm text-gray-400">Win Rate</div>
                <div className="text-xs text-gray-500 mt-1">
                  {analytics.winningTrades}W / {analytics.losingTrades}L
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Trading Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-white">Trading Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Trades</span>
                  <span className="text-white font-mono">{analytics.totalTrades}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Winning Trades</span>
                  <span className="text-green-400 font-mono">{analytics.winningTrades}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Losing Trades</span>
                  <span className="text-red-400 font-mono">{analytics.losingTrades}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Break Even</span>
                  <span className="text-gray-400 font-mono">{analytics.breakEvenTrades}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Volume</span>
                  <span className="text-white font-mono">{formatNumber(analytics.totalVolume)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Avg Trade Size</span>
                  <span className="text-white font-mono">{formatNumber(analytics.avgTradeSize)}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-white">Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Best Trade</span>
                  <span className="text-green-400 font-mono">{formatCurrency(analytics.bestTrade)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Worst Trade</span>
                  <span className="text-red-400 font-mono">{formatCurrency(analytics.worstTrade)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Avg Win</span>
                  <span className="text-green-400 font-mono">{formatCurrency(analytics.avgWin)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Avg Loss</span>
                  <span className="text-red-400 font-mono">{formatCurrency(analytics.avgLoss)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Profit Factor</span>
                  <span className="text-white font-mono">{analytics.profitFactor.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Max Drawdown</span>
                  <span className="text-red-400 font-mono">{formatCurrency(analytics.maxDrawdown)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Session Info */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-white">Session Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{analytics.sessionDuration}m</div>
                  <div className="text-sm text-gray-400">Session Duration</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{formatPercentage(analytics.winRate)}</div>
                  <div className="text-sm text-gray-400">Success Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{analytics.sharpeRatio.toFixed(2)}</div>
                  <div className="text-sm text-gray-400">Sharpe Ratio</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 pt-4">
            <Button
              onClick={onRestartSession}
              className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-2"
            >
              Start New Session
            </Button>
            <Button
              onClick={() => window.print()}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700/50"
            >
              Print Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SessionAnalytics;
