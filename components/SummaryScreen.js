import { formatCurrency } from '../lib/utils';

import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export default function SummaryScreen({ 
  finalCash, 
  finalHoldings, 
  finalTotalValue, 
  trades, 
  onRestart,
  totalPnL,
  companies, 
}) {
  // Calculate holdings value for each company
  const holdingsBreakdown = Object.entries(finalHoldings).map(([symbol, holding]) => {
    const company = companies.find(c => c.symbol === symbol);
    const currentPrice = company?.currentPrice || company?.startPrice || 0;
    const value = holding.quantity * currentPrice;
    const pnl = holding.quantity * (currentPrice - holding.averagePrice);
    
    return {
      symbol,
      name: company?.name || symbol,
      quantity: holding.quantity,
      averagePrice: holding.averagePrice,
      currentPrice,
      value,
      pnl,
    };
  });

  const totalHoldingsValue = holdingsBreakdown.reduce((sum, holding) => sum + holding.value, 0);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-blue-600">
              Trading Session Complete
            </CardTitle>
            <p className="text-gray-600">
              Your 90-minute trading simulation has ended
            </p>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Final Portfolio Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Final Portfolio Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Cash Balance:</span>
                <span className="font-semibold">{formatCurrency(finalCash)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Holdings Value:</span>
                <span className="font-semibold">{formatCurrency(holdingsValue)}</span>
              </div>
              
              <div className="flex justify-between text-lg">
                <span className="font-semibold">Total Portfolio Value:</span>
                <span className="font-bold">{formatCurrency(finalTotalValue)}</span>
              </div>
              
              <div className="flex justify-between text-lg">
                <span className="font-semibold">Total P&L:</span>
                <span className={`font-bold ${totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {totalPnL >= 0 ? '+' : ''}{formatCurrency(totalPnL)}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Total Trades:</span>
                <span className="font-semibold">{trades.length}</span>
              </div>
            </CardContent>
          </Card>

          {/* Holdings Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Holdings by Company</CardTitle>
            </CardHeader>
            <CardContent>
              {holdingsBreakdown.length > 0 ? (
                <div className="space-y-3">
                  {holdingsBreakdown.map((holding) => (
                    <div key={holding.symbol} className="p-3 bg-gray-50 rounded-md">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-semibold">{holding.symbol}</div>
                          <div className="text-sm text-gray-600">{holding.name}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{formatCurrency(holding.value)}</div>
                          <div className={`text-sm ${holding.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {holding.pnl >= 0 ? '+' : ''}{formatCurrency(holding.pnl)}
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Qty:</span> {holding.quantity}
                        </div>
                        <div>
                          <span className="text-gray-600">Avg:</span> {formatCurrency(holding.averagePrice)}
                        </div>
                        <div>
                          <span className="text-gray-600">Current:</span> {formatCurrency(holding.currentPrice)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No holdings at session end</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Trade History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Trade History</CardTitle>
          </CardHeader>
          <CardContent>
            {trades.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {trades.map((trade, index) => (
                  <div 
                    key={index}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-md"
                  >
                    <div className="flex items-center space-x-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        trade.type === 'buy' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {trade.type.toUpperCase()}
                      </span>
                      <span className="text-sm font-medium">{trade.symbol || 'Unknown'}</span>
                      <span className="text-sm text-gray-600">{trade.time}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(trade.price)}</div>
                      <div className="text-sm text-gray-600">Qty: {trade.quantity}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No trades executed during this session</p>
            )}
          </CardContent>
        </Card>

        {/* Restart Button */}
        <div className="text-center">
          <Button 
            onClick={onRestart}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
          >
            Start New Trading Session
          </Button>
        </div>
      </div>
    </div>
  );
}
