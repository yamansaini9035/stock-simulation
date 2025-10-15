import React from 'react';

import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const RiskMetricsPanel = ({ riskMetrics, isVisible = true, isCompactView = false }) => {
  if (!isVisible || !riskMetrics) {
    if (isCompactView) {
      return (
        <div className="space-y-3">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Risk Metrics</h2>
            <p className="text-sm text-gray-400">Portfolio risk analysis</p>
          </div>
          <div className="text-center py-8">
            <div className="text-gray-400 text-sm">No risk data available</div>
            <div className="text-xs text-gray-500 mt-1">Make trades to generate risk metrics</div>
          </div>
        </div>
      );
    }
    return null;
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value) => {
    return `${value.toFixed(2)}%`;
  };

  const getRiskLevelColor = (level) => {
    switch (level) {
    case 'Very High': return 'text-red-400';
    case 'High': return 'text-orange-400';
    case 'Medium': return 'text-yellow-400';
    case 'Low': return 'text-green-400';
    default: return 'text-gray-400';
    }
  };

  const getRiskLevelBadgeColor = (level) => {
    switch (level) {
    case 'Very High': return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'High': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    case 'Medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'Low': return 'bg-green-500/20 text-green-400 border-green-500/30';
    default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getMetricColor = (value, thresholds) => {
    if (value >= thresholds.good) return 'text-green-400';
    if (value >= thresholds.warning) return 'text-yellow-400';
    return 'text-red-400';
  };

  // Compact view for bottom panel
  if (isCompactView) {
    return (
      <div className="space-y-3">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Risk Metrics</h2>
          <p className="text-sm text-gray-400">Portfolio risk analysis</p>
        </div>

        {/* Risk Level - Most Prominent */}
        <div className="text-center p-4 bg-gray-800/50 rounded-lg border border-gray-700 mb-4">
          <div className="text-xs text-gray-400 mb-2">Current Risk Level</div>
          <div className={`text-3xl font-bold mb-2 ${getRiskLevelColor(riskMetrics.riskLevel?.level || 'Unknown')}`}>
            {riskMetrics.riskLevel?.level || 'Unknown'}
          </div>
          <div className="text-sm text-gray-300">
            Score: {riskMetrics.riskLevel?.score || 0}/{riskMetrics.riskLevel?.maxScore || 8}
          </div>
          <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: `${((riskMetrics.riskLevel?.score || 0) / (riskMetrics.riskLevel?.maxScore || 8)) * 100}%`,
                backgroundColor: riskMetrics.riskLevel?.color || '#6B7280',
              }}
            />
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-gray-800/30 rounded-lg border border-gray-700">
            <div className="text-xs text-gray-400 mb-1">Max Drawdown</div>
            <div className={`text-lg font-bold ${getMetricColor(riskMetrics.maxDrawdown?.percentage || 0, { good: 5, warning: 10 })}`}>
              {formatPercentage(riskMetrics.maxDrawdown?.percentage || 0)}
            </div>
            <div className="text-xs text-gray-500">
              Peak: {formatCurrency(riskMetrics.maxDrawdown?.peakValue || 0)}
            </div>
          </div>

          <div className="p-3 bg-gray-800/30 rounded-lg border border-gray-700">
            <div className="text-xs text-gray-400 mb-1">Sharpe Ratio</div>
            <div className={`text-lg font-bold ${getMetricColor(riskMetrics.sharpeRatio || 0, { good: 1, warning: 0.5 })}`}>
              {(riskMetrics.sharpeRatio || 0).toFixed(2)}
            </div>
            <div className="text-xs text-gray-500">Risk-adjusted returns</div>
          </div>

          <div className="p-3 bg-gray-800/30 rounded-lg border border-gray-700">
            <div className="text-xs text-gray-400 mb-1">Win/Loss Ratio</div>
            <div className={`text-lg font-bold ${getMetricColor(riskMetrics.winLoss?.ratio || 0, { good: 1.5, warning: 1 })}`}>
              {(riskMetrics.winLoss?.ratio || 0).toFixed(2)}
            </div>
            <div className="text-xs text-gray-500">
              {riskMetrics.winLoss?.totalWins || 0}W / {riskMetrics.winLoss?.totalLosses || 0}L
            </div>
          </div>

          <div className="p-3 bg-gray-800/30 rounded-lg border border-gray-700">
            <div className="text-xs text-gray-400 mb-1">Volatility</div>
            <div className={`text-lg font-bold ${getMetricColor(riskMetrics.volatility?.percentage || 0, { good: 10, warning: 20 })}`}>
              {formatPercentage(riskMetrics.volatility?.percentage || 0)}
            </div>
            <div className="text-xs text-gray-500">Portfolio volatility</div>
          </div>
        </div>

        {/* Advanced Metrics */}
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
          <div className="text-sm font-semibold text-cyan-400 mb-2">Advanced Metrics</div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Sortino Ratio</span>
              <span className={`font-bold ${getMetricColor(riskMetrics.sortinoRatio || 0, { good: 1, warning: 0.5 })}`}>
                {(riskMetrics.sortinoRatio || 0).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Calmar Ratio</span>
              <span className={`font-bold ${getMetricColor(riskMetrics.calmarRatio || 0, { good: 1, warning: 0.5 })}`}>
                {(riskMetrics.calmarRatio || 0).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">VaR (95%)</span>
              <span className={`font-bold ${getMetricColor(riskMetrics.valueAtRisk?.var95 || 0, { good: 5, warning: 10 })}`}>
                {formatPercentage(riskMetrics.valueAtRisk?.var95 || 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Total Return</span>
              <span className={`font-bold ${getMetricColor(riskMetrics.totalReturn || 0, { good: 10, warning: 0 })}`}>
                {formatPercentage(riskMetrics.totalReturn || 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Risk Assessment */}
        {riskMetrics.riskLevel?.level && (
          <div className="text-xs text-center p-2 rounded border border-gray-700">
            {riskMetrics.riskLevel?.level === 'Very High' && (
              <div className="text-red-400">⚠️ Very high risk detected</div>
            )}
            {riskMetrics.riskLevel?.level === 'High' && (
              <div className="text-orange-400">⚠️ High risk level</div>
            )}
            {riskMetrics.riskLevel?.level === 'Medium' && (
              <div className="text-yellow-400">ℹ️ Moderate risk level</div>
            )}
            {riskMetrics.riskLevel?.level === 'Low' && (
              <div className="text-green-400">✅ Low risk level</div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className="console-risk-metrics rounded-xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold text-white flex items-center gap-3">
          <svg className="w-5 h-5 accent-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span className="text-white">Risk Metrics</span>
        </CardTitle>
        <div className="w-full h-px bg-gray-600 mt-3"></div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Risk Level Assessment */}
        <div className="p-3 bg-gray-800/50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Risk Level</span>
            <Badge className={getRiskLevelBadgeColor(riskMetrics.riskLevel?.level || 'Unknown')}>
              {riskMetrics.riskLevel?.level || 'Unknown'}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Risk Score</span>
            <span className={`text-sm font-bold ${getRiskLevelColor(riskMetrics.riskLevel?.level || 'Unknown')}`}>
              {riskMetrics.riskLevel?.score || 0}/{riskMetrics.riskLevel?.maxScore || 8}
            </span>
          </div>
          {/* Risk Score Bar */}
          <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: `${((riskMetrics.riskLevel?.score || 0) / (riskMetrics.riskLevel?.maxScore || 8)) * 100}%`,
                backgroundColor: riskMetrics.riskLevel?.color || '#6B7280',
              }}
            />
          </div>
        </div>

        {/* Key Risk Metrics */}
        <div className="grid grid-cols-1 gap-3">
          {/* Max Drawdown */}
          <div className="p-3 bg-gray-800/30 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-400">Max Drawdown</span>
              <span className={`text-sm font-bold ${getMetricColor(riskMetrics.maxDrawdown?.percentage || 0, { good: 5, warning: 10 })}`}>
                {formatPercentage(riskMetrics.maxDrawdown?.percentage || 0)}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              Peak: {formatCurrency(riskMetrics.maxDrawdown?.peakValue || 0)} → 
              Trough: {formatCurrency(riskMetrics.maxDrawdown?.troughValue || 0)}
            </div>
          </div>

          {/* Sharpe Ratio */}
          <div className="p-3 bg-gray-800/30 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-400">Sharpe Ratio</span>
              <span className={`text-sm font-bold ${getMetricColor(riskMetrics.sharpeRatio || 0, { good: 1, warning: 0.5 })}`}>
                {(riskMetrics.sharpeRatio || 0).toFixed(2)}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              Risk-adjusted returns
            </div>
          </div>

          {/* Win/Loss Ratio */}
          <div className="p-3 bg-gray-800/30 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-400">Win/Loss Ratio</span>
              <span className={`text-sm font-bold ${getMetricColor(riskMetrics.winLoss?.ratio || 0, { good: 1.5, warning: 1 })}`}>
                {(riskMetrics.winLoss?.ratio || 0).toFixed(2)}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              {riskMetrics.winLoss?.totalWins || 0}W / {riskMetrics.winLoss?.totalLosses || 0}L 
              ({formatPercentage(riskMetrics.winLoss?.winRate || 0)})
            </div>
          </div>

          {/* Volatility */}
          <div className="p-3 bg-gray-800/30 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-400">Volatility</span>
              <span className={`text-sm font-bold ${getMetricColor(riskMetrics.volatility?.percentage || 0, { good: 10, warning: 20 })}`}>
                {formatPercentage(riskMetrics.volatility?.percentage || 0)}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              Portfolio price volatility
            </div>
          </div>
        </div>

        {/* Advanced Metrics */}
        <div className="pt-4 border-t border-gray-700">
          <div className="text-sm font-medium text-gray-300 mb-3">Advanced Metrics</div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="text-center">
              <div className="text-gray-400">Sortino Ratio</div>
              <div className={`font-bold ${getMetricColor(riskMetrics.sortinoRatio || 0, { good: 1, warning: 0.5 })}`}>
                {(riskMetrics.sortinoRatio || 0).toFixed(2)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-gray-400">Calmar Ratio</div>
              <div className={`font-bold ${getMetricColor(riskMetrics.calmarRatio || 0, { good: 1, warning: 0.5 })}`}>
                {(riskMetrics.calmarRatio || 0).toFixed(2)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-gray-400">VaR (95%)</div>
              <div className={`font-bold ${getMetricColor(riskMetrics.valueAtRisk?.var95 || 0, { good: 5, warning: 10 })}`}>
                {formatPercentage(riskMetrics.valueAtRisk?.var95 || 0)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-gray-400">Total Return</div>
              <div className={`font-bold ${getMetricColor(riskMetrics.totalReturn || 0, { good: 10, warning: 0 })}`}>
                {formatPercentage(riskMetrics.totalReturn || 0)}
              </div>
            </div>
          </div>
        </div>

        {/* Risk Interpretation */}
        <div className="pt-4 border-t border-gray-700">
          <div className="text-sm font-medium text-gray-300 mb-2">Risk Assessment</div>
          <div className="text-xs text-gray-400 space-y-1">
            {riskMetrics.riskLevel?.level === 'Very High' && (
              <div className="text-red-400">
                ⚠️ Very high risk detected. Consider reducing position sizes and improving risk management.
              </div>
            )}
            {riskMetrics.riskLevel?.level === 'High' && (
              <div className="text-orange-400">
                ⚠️ High risk level. Monitor positions closely and consider risk reduction strategies.
              </div>
            )}
            {riskMetrics.riskLevel?.level === 'Medium' && (
              <div className="text-yellow-400">
                ℹ️ Moderate risk level. Maintain current strategy with regular monitoring.
              </div>
            )}
            {riskMetrics.riskLevel?.level === 'Low' && (
              <div className="text-green-400">
                ✅ Low risk level. Good risk management practices in place.
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RiskMetricsPanel;
