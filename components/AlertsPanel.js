import React, { useState } from 'react';

import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const AlertsPanel = ({ 
  alerts, 
  triggeredAlerts, 
  onCreateAlert, 
  onDeleteAlert, 
  onDeactivateAlert,
  isVisible = true, 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newAlert, setNewAlert] = useState({
    symbol: '',
    type: 'price_above',
    targetPrice: '',
    message: '',
  });

  if (!isVisible) {
    return null;
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getAlertTypeColor = (type) => {
    switch (type) {
    case 'price_above': return 'text-green-400';
    case 'price_below': return 'text-red-400';
    case 'stop_loss': return 'text-orange-400';
    case 'take_profit': return 'text-blue-400';
    case 'session_warning': return 'text-yellow-400';
    case 'session_ending': return 'text-red-400';
    default: return 'text-gray-400';
    }
  };

  const getAlertTypeIcon = (type) => {
    switch (type) {
    case 'price_above': return '📈';
    case 'price_below': return '📉';
    case 'stop_loss': return '🛑';
    case 'take_profit': return '💰';
    case 'session_warning': return '⏰';
    case 'session_ending': return '🚨';
    default: return '🔔';
    }
  };

  const getAlertStatusColor = (isActive, triggeredAt) => {
    if (triggeredAt) return 'bg-red-500/20 text-red-400 border-red-500/30';
    if (isActive) return 'bg-green-500/20 text-green-400 border-green-500/30';
    return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const handleCreateAlert = () => {
    if (!newAlert.symbol || !newAlert.targetPrice) return;

    onCreateAlert({
      symbol: newAlert.symbol.toUpperCase(),
      type: newAlert.type,
      targetPrice: parseFloat(newAlert.targetPrice),
      message: newAlert.message || undefined,
    });

    setNewAlert({
      symbol: '',
      type: 'price_above',
      targetPrice: '',
      message: '',
    });
    setShowCreateForm(false);
  };

  const allAlerts = [...(alerts || []), ...(triggeredAlerts || [])];
  const activeAlerts = allAlerts.filter(alert => alert.isActive);
  const triggeredAlertsList = allAlerts.filter(alert => alert.triggeredAt);

  return (
    <Card className="console-alerts rounded-xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 accent-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.828 7l2.586 2.586a2 2 0 002.828 0L16 7H4.828zM4.828 17l2.586-2.586a2 2 0 012.828 0L16 17H4.828z" />
            </svg>
            <span className="text-white">Alerts</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs text-gray-400">
              {activeAlerts.length} active
            </Badge>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              {isExpanded ? '−' : '+'}
            </button>
          </div>
        </CardTitle>
        <div className="w-full h-px bg-gray-600 mt-3"></div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Create Alert Button */}
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="w-full bg-cyan-500 hover:bg-cyan-600 text-white"
        >
          + New Alert
        </Button>

        {/* Create Alert Form */}
        {showCreateForm && (
          <div className="p-4 bg-gray-800/50 rounded-lg space-y-3">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Symbol</label>
              <input
                type="text"
                value={newAlert.symbol}
                onChange={(e) => setNewAlert({ ...newAlert, symbol: e.target.value })}
                placeholder="e.g., RELIANCE"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Alert Type</label>
              <select
                value={newAlert.type}
                onChange={(e) => setNewAlert({ ...newAlert, type: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              >
                <option value="price_above">Price Above</option>
                <option value="price_below">Price Below</option>
                <option value="stop_loss">Stop Loss</option>
                <option value="take_profit">Take Profit</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Target Price</label>
              <input
                type="number"
                value={newAlert.targetPrice}
                onChange={(e) => setNewAlert({ ...newAlert, targetPrice: e.target.value })}
                placeholder="e.g., 2500"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Message (Optional)</label>
              <input
                type="text"
                value={newAlert.message}
                onChange={(e) => setNewAlert({ ...newAlert, message: e.target.value })}
                placeholder="Custom message"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleCreateAlert}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                Create Alert
              </Button>
              <Button
                onClick={() => setShowCreateForm(false)}
                variant="outline"
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700/50"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Active Alerts */}
        {isExpanded && (
          <div className="space-y-3">
            <div className="text-sm font-medium text-gray-300">Active Alerts</div>
            {activeAlerts.length === 0 ? (
              <div className="text-center py-4 text-gray-500 text-sm">
                No active alerts
              </div>
            ) : (
              activeAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="p-3 bg-gray-800/30 rounded-lg border border-gray-700"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getAlertTypeIcon(alert.type)}</span>
                      <span className="text-sm font-medium text-white">
                        {alert.symbol}
                      </span>
                      <Badge className={getAlertStatusColor(alert.isActive, alert.triggeredAt)}>
                        Active
                      </Badge>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        onClick={() => onDeactivateAlert(alert.id)}
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-white p-1"
                      >
                        ⏸️
                      </Button>
                      <Button
                        onClick={() => onDeleteAlert(alert.id)}
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-red-400 p-1"
                      >
                        🗑️
                      </Button>
                    </div>
                  </div>
                  <div className="text-sm text-gray-400 mb-1">
                    {alert.message}
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className={getAlertTypeColor(alert.type)}>
                      {alert.type.replace('_', ' ').toUpperCase()}
                    </span>
                    <span>
                      Target: {formatCurrency(alert.targetPrice)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Triggered Alerts */}
        {triggeredAlertsList.length > 0 && (
          <div className="pt-4 border-t border-gray-700">
            <div className="text-sm font-medium text-gray-300 mb-3">Recent Triggers</div>
            <div className="space-y-2">
              {triggeredAlertsList.slice(0, 5).map((alert) => (
                <div
                  key={alert.id}
                  className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">🚨</span>
                    <span className="text-sm font-medium text-white">
                      {alert.symbol}
                    </span>
                    <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                      Triggered
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-400 mb-1">
                    {alert.message}
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                      Triggered at: {formatCurrency(alert.triggeredPrice)}
                    </span>
                    <span>
                      {new Date(alert.triggeredAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Alert Statistics */}
        <div className="pt-4 border-t border-gray-700">
          <div className="text-sm font-medium text-gray-300 mb-3">Statistics</div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="text-center">
              <div className="text-gray-400">Active</div>
              <div className="text-green-400 font-bold">{activeAlerts.length}</div>
            </div>
            <div className="text-center">
              <div className="text-gray-400">Triggered</div>
              <div className="text-red-400 font-bold">{triggeredAlertsList.length}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AlertsPanel;
