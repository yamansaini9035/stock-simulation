import React, { useState, useEffect } from 'react';

import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const OrdersPanel = ({ userId, orders = [], onCancelOrder }) => {
  const [cancelling, setCancelling] = useState({});

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
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

  const getOrderTypeColor = (type) => {
    switch (type) {
    case 'MARKET': return 'text-blue-400';
    case 'LIMIT': return 'text-yellow-400';
    case 'STOP_LOSS': return 'text-red-400';
    case 'TAKE_PROFIT': return 'text-green-400';
    default: return 'text-gray-400';
    }
  };

  const getOrderTypeBgColor = (type) => {
    switch (type) {
    case 'MARKET': return 'bg-blue-900/20 border-blue-500/30';
    case 'LIMIT': return 'bg-yellow-900/20 border-yellow-500/30';
    case 'STOP_LOSS': return 'bg-red-900/20 border-red-500/30';
    case 'TAKE_PROFIT': return 'bg-green-900/20 border-green-500/30';
    default: return 'bg-gray-900/20 border-gray-500/30';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
    case 'PENDING': return 'text-yellow-400';
    case 'EXECUTED': return 'text-green-400';
    case 'CANCELLED': return 'text-red-400';
    default: return 'text-gray-400';
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
    case 'PENDING': return 'bg-yellow-900/20 border-yellow-500/30';
    case 'EXECUTED': return 'bg-green-900/20 border-green-500/30';
    case 'CANCELLED': return 'bg-red-900/20 border-red-500/30';
    default: return 'bg-gray-900/20 border-gray-500/30';
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (cancelling[orderId]) return;

    setCancelling(prev => ({ ...prev, [orderId]: true }));

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/orders?orderId=${orderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        onCancelOrder && onCancelOrder(orderId);
        console.log('Order cancelled successfully');
      } else {
        console.error('Failed to cancel order:', result.error);
        alert(`Failed to cancel order: ${result.error}`);
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert('Error cancelling order');
    } finally {
      setCancelling(prev => ({ ...prev, [orderId]: false }));
    }
  };

  if (!orders || orders.length === 0) {
    return (
      <Card className="console-orders rounded-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold text-white flex items-center gap-3">
            <svg className="w-5 h-5 accent-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <span className="text-white">Orders</span>
          </CardTitle>
          <div className="w-full h-px bg-gray-600 mt-3"></div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <p className="text-gray-400 text-sm">No orders placed yet</p>
            <p className="text-gray-500 text-xs mt-1">Your pending orders will appear here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="console-orders rounded-xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold text-white flex items-center gap-3">
          <svg className="w-5 h-5 accent-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          <span className="text-white">Orders</span>
          <span className="text-sm text-cyan-300 ml-auto">({orders.length})</span>
        </CardTitle>
        <div className="w-full h-px bg-gray-600 mt-3"></div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {orders.map((order) => (
            <div
              key={order.id}
              className={`p-3 rounded-lg border ${getOrderTypeBgColor(order.type)}`}
            >
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="col-span-2 flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getOrderTypeColor(order.type)}`}>
                      {order.type.replace('_', ' ')}
                    </span>
                    <span className="text-white font-semibold">{order.symbol}</span>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      order.side === 'BUY' ? 'text-green-400 bg-green-900/20' : 'text-red-400 bg-red-900/20'
                    }`}>
                      {order.side}
                    </span>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                
                <div>
                  <p className="text-cyan-300 text-xs mb-1">Quantity</p>
                  <p className="text-white font-semibold">{order.quantity}</p>
                </div>
                
                <div>
                  <p className="text-cyan-300 text-xs mb-1">
                    {order.type === 'MARKET' ? 'Market Price' : 'Target Price'}
                  </p>
                  <p className="text-white font-semibold">
                    {order.targetPrice ? formatCurrency(order.targetPrice) : 'Market'}
                  </p>
                </div>
                
                <div>
                  <p className="text-cyan-300 text-xs mb-1">Created</p>
                  <p className="text-white font-semibold text-xs">
                    {formatDateTime(order.createdAt)}
                  </p>
                </div>
                
                <div>
                  <p className="text-cyan-300 text-xs mb-1">Action</p>
                  {order.status === 'PENDING' ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-6 px-2 border-red-500 text-red-400 hover:bg-red-900/20"
                      onClick={() => handleCancelOrder(order.id)}
                      disabled={cancelling[order.id]}
                    >
                      {cancelling[order.id] ? 'Cancelling...' : 'Cancel'}
                    </Button>
                  ) : (
                    <span className="text-xs text-gray-400">
                      {order.executedAt ? formatDateTime(order.executedAt) : 'N/A'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {orders.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-600">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center p-2 rounded-lg" style={{ backgroundColor: 'rgba(0, 255, 200, 0.1)' }}>
                <p className="text-cyan-300 text-xs mb-1">Total Orders</p>
                <p className="text-white font-bold">{orders.length}</p>
              </div>
              <div className="text-center p-2 rounded-lg" style={{ backgroundColor: 'rgba(0, 255, 200, 0.1)' }}>
                <p className="text-cyan-300 text-xs mb-1">Pending</p>
                <p className="text-white font-bold">
                  {orders.filter(o => o.status === 'PENDING').length}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrdersPanel;
