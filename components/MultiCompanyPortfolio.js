import { formatCurrency } from '../lib/utils';

import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export default function MultiCompanyPortfolio({ 
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
  const selectedCompanyHoldings = holdings[selectedCompany?.symbol] || { quantity: 0, averagePrice: 0 };
  const selectedCompanyValue = selectedCompanyHoldings.quantity * currentPrice;
  const selectedCompanyPnL = selectedCompanyHoldings.quantity * (currentPrice - selectedCompanyHoldings.averagePrice);

  // Calculate total holdings value across all companies using current prices
  const totalHoldingsValue = Object.keys(holdings).reduce((total, symbol) => {
    const company = companies.find(c => c.symbol === symbol);
    if (company) {
      const companyData = holdings[symbol];
      const currentPrice = company.currentPrice || company.startPrice;
      return total + (companyData.quantity * currentPrice);
    }
    return total;
  }, 0);

  const totalUnrealizedPnL = Object.keys(holdings).reduce((total, symbol) => {
    const company = companies.find(c => c.symbol === symbol);
    if (company) {
      const companyData = holdings[symbol];
      const currentPrice = company.currentPrice || company.startPrice;
      return total + (companyData.quantity * (currentPrice - companyData.averagePrice));
    }
    return total;
  }, 0);

  const totalPnLPercentage = totalValue > 0 ? ((totalValue - 10000) / 10000) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <Card className="card-professional">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
            Portfolio Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Total Portfolio Value */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Total Portfolio Value</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalValue)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">P&L</p>
                <div className="flex items-center gap-2">
                  <span className={`text-lg font-bold ${totalPnLPercentage >= 0 ? 'text-success' : 'text-danger'}`}>
                    {totalPnLPercentage >= 0 ? '+' : ''}{totalPnLPercentage.toFixed(2)}%
                  </span>
                  <span className={`text-sm ${totalUnrealizedPnL >= 0 ? 'text-success' : 'text-danger'}`}>
                    {totalUnrealizedPnL >= 0 ? '+' : ''}{formatCurrency(totalUnrealizedPnL)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Portfolio Breakdown */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  <span className="text-sm text-gray-600">Cash Balance</span>
                </div>
                <span className="font-semibold text-gray-900">{formatCurrency(cash)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span className="text-sm text-gray-600">Holdings Value</span>
                </div>
                <span className="font-semibold text-gray-900">{formatCurrency(totalHoldingsValue)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span className="text-sm text-gray-600">Trades Executed</span>
                </div>
                <span className="font-semibold text-gray-900">{tradesCount}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-gray-600">Unrealized P&L</span>
                </div>
                <span className={`font-semibold ${totalUnrealizedPnL >= 0 ? 'text-success' : 'text-danger'}`}>
                  {totalUnrealizedPnL >= 0 ? '+' : ''}{formatCurrency(totalUnrealizedPnL)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Company Holdings */}
      {selectedCompany && (
        <Card className="card-professional">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {selectedCompany.symbol.charAt(0)}
                </span>
              </div>
              {selectedCompany.symbol} Holdings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedCompanyHoldings.quantity > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Quantity</span>
                      <span className="font-semibold text-gray-900">{selectedCompanyHoldings.quantity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Average Price</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(selectedCompanyHoldings.averagePrice)}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Current Price</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(currentPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Unrealized P&L</span>
                      <span className={`font-semibold ${selectedCompanyPnL >= 0 ? 'text-success' : 'text-danger'}`}>
                        {selectedCompanyPnL >= 0 ? '+' : ''}{formatCurrency(selectedCompanyPnL)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Position Value</span>
                    <span className="text-lg font-bold text-gray-900">{formatCurrency(selectedCompanyValue)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <p className="text-gray-500 text-sm">No holdings in {selectedCompany.symbol}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Trading Controls */}
      <Card className="card-professional">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Trade {selectedCompany?.symbol || 'Select Company'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Button 
              onClick={onBuy}
              disabled={!isSessionActive || !selectedCompany || cash < currentPrice}
              className="btn-success w-full py-3 text-base font-semibold"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Buy {selectedCompany?.symbol || 'Asset'}
            </Button>
            <Button 
              onClick={onSell}
              disabled={!isSessionActive || !selectedCompany || selectedCompanyHoldings.quantity === 0}
              className="btn-danger w-full py-3 text-base font-semibold"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Sell {selectedCompany?.symbol || 'Asset'}
            </Button>
          </div>
          
          {!isSessionActive && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <p className="text-sm text-red-700 font-medium">Session ended. Trading is disabled.</p>
              </div>
            </div>
          )}
          
          {isSessionActive && selectedCompany && cash < currentPrice && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <p className="text-sm text-yellow-700 font-medium">Insufficient cash to buy {selectedCompany.symbol}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Holdings Table */}
      <Card className="card-professional">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            All Holdings
          </CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(holdings).length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 font-semibold text-gray-700">Symbol</th>
                    <th className="text-right py-3 px-2 font-semibold text-gray-700">Qty</th>
                    <th className="text-right py-3 px-2 font-semibold text-gray-700">Avg Price</th>
                    <th className="text-right py-3 px-2 font-semibold text-gray-700">Current</th>
                    <th className="text-right py-3 px-2 font-semibold text-gray-700">P&L</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(holdings).map(([symbol, holding], index) => {
                    const company = companies.find(c => c.symbol === symbol);
                    const currentPrice = company?.currentPrice || company?.startPrice || 0;
                    const pnl = holding.quantity * (currentPrice - holding.averagePrice);
                    
                    return (
                      <tr key={symbol} className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                        <td className="py-3 px-2 font-medium text-gray-900">{symbol}</td>
                        <td className="py-3 px-2 text-right text-gray-900">{holding.quantity}</td>
                        <td className="py-3 px-2 text-right text-gray-900">{formatCurrency(holding.averagePrice)}</td>
                        <td className="py-3 px-2 text-right text-gray-900">{formatCurrency(currentPrice)}</td>
                        <td className={`py-3 px-2 text-right font-medium ${pnl >= 0 ? 'text-success' : 'text-danger'}`}>
                          {pnl >= 0 ? '+' : ''}{formatCurrency(pnl)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <p className="text-gray-500 text-sm">No holdings across any companies</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
