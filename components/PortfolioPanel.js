import { formatCurrency } from '../lib/utils';

import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export default function PortfolioPanel({ 
  cash, 
  holdings, 
  currentPrice, 
  totalValue, 
  unrealizedPnL, 
  tradesCount,
  onBuy,
  onSell,
  isSessionActive, 
}) {
  const holdingsValue = holdings.quantity * currentPrice;
  const averagePrice = holdings.quantity > 0 ? holdings.averagePrice : 0;

  return (
    <div className="space-y-4">
      {/* Portfolio Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Portfolio Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Cash Balance:</span>
            <span className="font-semibold">{formatCurrency(cash)}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Holdings Value:</span>
            <span className="font-semibold">{formatCurrency(holdingsValue)}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Total Value:</span>
            <span className="font-bold text-lg">{formatCurrency(totalValue)}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Unrealized P&L:</span>
            <span className={`font-semibold ${unrealizedPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {unrealizedPnL >= 0 ? '+' : ''}{formatCurrency(unrealizedPnL)}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Trades Executed:</span>
            <span className="font-semibold">{tradesCount}</span>
          </div>
        </CardContent>
      </Card>

      {/* Holdings Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Current Holdings</CardTitle>
        </CardHeader>
        <CardContent>
          {holdings.quantity > 0 ? (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Quantity:</span>
                <span className="font-semibold">{holdings.quantity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Average Price:</span>
                <span className="font-semibold">{formatCurrency(averagePrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Current Price:</span>
                <span className="font-semibold">{formatCurrency(currentPrice)}</span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No holdings</p>
          )}
        </CardContent>
      </Card>

      {/* Trading Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Trading Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Button 
              onClick={onBuy}
              disabled={!isSessionActive || cash < currentPrice}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Buy Asset
            </Button>
            <Button 
              onClick={onSell}
              disabled={!isSessionActive || holdings.quantity === 0}
              variant="destructive"
            >
              Sell Asset
            </Button>
          </div>
          
          {!isSessionActive && (
            <p className="text-sm text-gray-500 text-center">
              Session ended. Trading is disabled.
            </p>
          )}
          
          {isSessionActive && cash < currentPrice && (
            <p className="text-sm text-red-500 text-center">
              Insufficient cash to buy
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
