import { useEffect, useState } from 'react';

import { formatCurrency } from '../lib/utils';

export default function CompanyInfoPanel({ companyData, currentPrice, symbol, isCompactView = false }) {
  const [info, setInfo] = useState(companyData);

  useEffect(() => {
    const load = async () => {
      try {
        if (!symbol) return;
        const res = await fetch(`/api/company-info?symbol=${encodeURIComponent(symbol)}`);
        const json = await res.json();
        setInfo(json && Object.keys(json).length ? json : companyData);
      } catch (_) {
        setInfo(companyData);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol]);

  if (!info) {
    return (
      <div className={`${isCompactView ? 'p-4' : 'mt-6 p-6'} ${isCompactView ? '' : 'rounded-xl border'}`} style={isCompactView ? {} : { 
        background: 'linear-gradient(135deg, rgba(15, 15, 20, 0.95) 0%, rgba(5, 5, 8, 0.95) 100%)', 
        borderColor: '#00FFC8',
        boxShadow: '0 8px 32px rgba(0, 255, 200, 0.15), 0 0 0 1px rgba(0, 255, 200, 0.1)',
        backdropFilter: 'blur(10px)',
      }}>
        <div className="text-center">
          <p className={`text-gray-400 ${isCompactView ? 'text-sm' : 'text-white text-lg'}`}>
            {isCompactView ? 'Select a company' : 'Select a company to view detailed information'}
          </p>
        </div>
      </div>
    );
  }

  // Calculate price change
  const priceChange = currentPrice - (info.previousClose || 0);
  const priceChangePercent = info.previousClose ? (priceChange / info.previousClose) * 100 : 0;
  const isPositive = priceChange >= 0;

  // Compact view for bottom panel
  if (isCompactView) {
    return (
      <div className="space-y-3">
        {/* Company Name & Industry - Enhanced */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-1 leading-tight">{info.name}</h2>
          <p className="text-sm text-gray-400">{info.sector} • {info.industry}</p>
        </div>
        
        {/* Price & Change - Most Prominent */}
        <div className="flex items-baseline gap-3 mb-4">
          <div className="text-4xl font-bold text-white font-mono">
            {formatCurrency(currentPrice)}
          </div>
          <div className={`text-lg font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {isPositive ? '+' : ''}{formatCurrency(priceChange)} ({isPositive ? '+' : ''}{priceChangePercent.toFixed(2)}%)
          </div>
        </div>
        
        {/* Market Information */}
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
          <h3 className="text-sm font-semibold text-cyan-400 mb-2">Market Information</h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Market Cap</span>
              <span className="text-cyan-400 font-mono">{info.marketCap}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Previous Close</span>
              <span className="text-cyan-400 font-mono">{formatCurrency(info.previousClose || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Open Price</span>
              <span className="text-cyan-400 font-mono">{formatCurrency(info.open || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Day's Range</span>
              <span className="text-cyan-400 font-mono">{info.dayRange}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">52W Range</span>
              <span className="text-cyan-400 font-mono">{info.fiftyTwoWeekRange}</span>
            </div>
          </div>
        </div>

        {/* Trading Information */}
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
          <h3 className="text-sm font-semibold text-cyan-400 mb-2">Trading Information</h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Volume (Today)</span>
              <span className="text-cyan-400 font-mono">{info.volume}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Average Volume</span>
              <span className="text-cyan-400 font-mono">{info.avgVolume}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">P/E Ratio</span>
              <span className="text-cyan-400 font-mono">{info.peRatio}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">EPS</span>
              <span className="text-cyan-400 font-mono">{formatCurrency(info.eps || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Beta</span>
              <span className="text-cyan-400 font-mono">{info.beta}</span>
            </div>
          </div>
        </div>

        {/* Financial Information */}
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
          <h3 className="text-sm font-semibold text-cyan-400 mb-2">Financial Information</h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Revenue (FY)</span>
              <span className="text-cyan-400 font-mono">{info.revenue}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Net Income (FY)</span>
              <span className="text-cyan-400 font-mono">{info.netIncome}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Dividend Yield</span>
              <span className="text-cyan-400 font-mono">{info.dividendYield}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Employees</span>
              <span className="text-cyan-400 font-mono">{info.employees}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Symbol</span>
              <span className="text-cyan-400 font-mono">{info.symbol}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      {/* Company Header */}
      <div className="rounded-xl p-6 border" style={{ 
        background: 'linear-gradient(135deg, rgba(15, 15, 20, 0.95) 0%, rgba(5, 5, 8, 0.95) 100%)', 
        borderColor: '#00FFC8',
        boxShadow: '0 8px 32px rgba(0, 255, 200, 0.15), 0 0 0 1px rgba(0, 255, 200, 0.1)',
        backdropFilter: 'blur(10px)',
      }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">{info.name}</h2>
            <p className="text-cyan-400 text-sm">{info.sector} • {info.industry}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-white font-mono mb-1">
              {formatCurrency(currentPrice)}
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-mono ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {isPositive ? '+' : ''}{formatCurrency(priceChange)}
              </span>
              <span className={`text-sm font-mono ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                ({isPositive ? '+' : ''}{priceChangePercent.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Market Information */}
        <div className="rounded-xl p-4 border" style={{ 
          background: 'linear-gradient(135deg, rgba(15, 15, 20, 0.95) 0%, rgba(5, 5, 8, 0.95) 100%)', 
          borderColor: '#00FFC8',
          boxShadow: '0 8px 32px rgba(0, 255, 200, 0.15), 0 0 0 1px rgba(0, 255, 200, 0.1)',
          backdropFilter: 'blur(10px)',
        }}>
          <h3 className="text-lg font-semibold text-cyan-400 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            Market Information
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white text-sm">Market Cap</span>
              <span className="text-cyan-400 font-mono font-semibold">{info.marketCap}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white text-sm">Previous Close</span>
              <span className="text-cyan-400 font-mono font-semibold">{formatCurrency(info.previousClose || 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white text-sm">Open Price</span>
              <span className="text-cyan-400 font-mono font-semibold">{formatCurrency(info.open || 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white text-sm">Day's Range</span>
              <span className="text-cyan-400 font-mono font-semibold">{info.dayRange}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white text-sm">52W Range</span>
              <span className="text-cyan-400 font-mono font-semibold">{info.fiftyTwoWeekRange}</span>
            </div>
          </div>
        </div>

        {/* Trading Information */}
        <div className="rounded-xl p-4 border" style={{ 
          background: 'linear-gradient(135deg, rgba(15, 15, 20, 0.95) 0%, rgba(5, 5, 8, 0.95) 100%)', 
          borderColor: '#00FFC8',
          boxShadow: '0 8px 32px rgba(0, 255, 200, 0.15), 0 0 0 1px rgba(0, 255, 200, 0.1)',
          backdropFilter: 'blur(10px)',
        }}>
          <h3 className="text-lg font-semibold text-cyan-400 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Trading Information
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white text-sm">Volume (Today)</span>
              <span className="text-cyan-400 font-mono font-semibold">{info.volume}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white text-sm">Average Volume</span>
              <span className="text-cyan-400 font-mono font-semibold">{info.avgVolume}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white text-sm">P/E Ratio</span>
              <span className="text-cyan-400 font-mono font-semibold">{info.peRatio}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white text-sm">EPS</span>
              <span className="text-cyan-400 font-mono font-semibold">{formatCurrency(info.eps || 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white text-sm">Beta</span>
              <span className="text-cyan-400 font-mono font-semibold">{info.beta}</span>
            </div>
          </div>
        </div>

        {/* Financial Information */}
        <div className="rounded-xl p-4 border" style={{ 
          background: 'linear-gradient(135deg, rgba(15, 15, 20, 0.95) 0%, rgba(5, 5, 8, 0.95) 100%)', 
          borderColor: '#00FFC8',
          boxShadow: '0 8px 32px rgba(0, 255, 200, 0.15), 0 0 0 1px rgba(0, 255, 200, 0.1)',
          backdropFilter: 'blur(10px)',
        }}>
          <h3 className="text-lg font-semibold text-cyan-400 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
            Financial Information
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white text-sm">Revenue (FY)</span>
              <span className="text-cyan-400 font-mono font-semibold">{info.revenue}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white text-sm">Net Income (FY)</span>
              <span className="text-cyan-400 font-mono font-semibold">{info.netIncome}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white text-sm">Dividend Yield</span>
              <span className="text-cyan-400 font-mono font-semibold">{info.dividendYield}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white text-sm">Employees</span>
              <span className="text-cyan-400 font-mono font-semibold">{info.employees}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white text-sm">Symbol</span>
              <span className="text-cyan-400 font-mono font-semibold">{info.symbol}</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
