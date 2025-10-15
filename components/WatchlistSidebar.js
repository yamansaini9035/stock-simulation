import { useState, useEffect } from 'react';

import { formatCurrency } from '../lib/utils';

export default function WatchlistSidebar({ 
  companies, 
  selectedCompany, 
  onCompanyChange,
  searchTerm,
  onSearchChange, 
}) {
  const [filteredCompanies, setFilteredCompanies] = useState(companies);
  const [compactView, setCompactView] = useState(false);

  useEffect(() => {
    if (searchTerm) {
      const filtered = companies.filter(company => 
        company.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      setFilteredCompanies(filtered);
    } else {
      setFilteredCompanies(companies);
    }
  }, [searchTerm, companies]);

  const calculatePriceChange = (company) => {
    // Prefer real-time tick change from WebSocket if present
    if (typeof company.change === 'number') {
      const pct = typeof company.changePercent === 'number' ? company.changePercent : 0;
      return { change: company.change, percentage: pct };
    }
    // Fallback: compare against starting price
    if (!company.currentPrice || !company.startPrice) return { change: 0, percentage: 0 };
    const change = company.currentPrice - company.startPrice;
    const percentage = (change / company.startPrice) * 100;
    return { change, percentage };
  };

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-white">Watchlist</h3>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search symbols..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-white placeholder-gray-400 bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
          <svg className="absolute right-3 top-3 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Company List */}
      <div className="flex-1 overflow-y-auto">
        {filteredCompanies.map((company) => {
          const { change, percentage } = calculatePriceChange(company);
          const isSelected = selectedCompany?.symbol === company.symbol;
          const isPositive = change > 0;
          const isNegative = change < 0;

          return (
            <div
              key={company.symbol}
              className={`p-3 border-b border-gray-600 cursor-pointer hover:bg-gray-800 transition-colors ${
                isSelected ? 'bg-teal-600/20 border-teal-500' : ''
              }`}
              onClick={() => onCompanyChange(company)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-gray-200 text-base">
                    {company.symbol}
                  </h4>
                </div>
                
                <div className="text-right min-w-[140px]">
                  <div className="flex items-center justify-end gap-2 mb-1">
                    <div className="text-lg font-bold text-white font-mono">
                      {formatCurrency(company.currentPrice || company.startPrice || 0)}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M3 13h2l3-3 4 4 6-6 2 2v-2H3v2zm0 6h18v-2H3v2z"/>
                      </svg>
                      <span>{company.volatility?.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className={`text-sm font-normal flex items-center justify-end gap-1 ${isPositive ? 'text-green-400' : isNegative ? 'text-red-400' : 'text-gray-400'}`}>
                    <span>{isPositive ? '▲' : isNegative ? '▼' : ''}</span>
                    <span>{isPositive ? '+' : ''}{formatCurrency(change)}</span>
                  </div>
                  <div className={`text-xs font-normal ${isPositive ? 'text-green-400' : isNegative ? 'text-red-400' : 'text-gray-400'}`}>
                    ({isPositive ? '+' : ''}{percentage.toFixed(2)}%)
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <div className="text-xs text-white text-center">
          {filteredCompanies.length} companies
        </div>
      </div>
    </div>
  );
}
