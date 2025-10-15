import React, { useState, useEffect } from 'react';

import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const LeaderboardPanel = ({ leaderboardData, currentUserId, isVisible = true }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isVisible || !leaderboardData || !leaderboardData.rankings) {
    return null;
  }

  const { rankings, sessionStats, lastUpdate } = leaderboardData;
  const currentUserRank = rankings.find(rank => rank.userId === currentUserId);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const getRankColor = (rank) => {
    if (rank === 1) return 'text-yellow-400';
    if (rank === 2) return 'text-gray-300';
    if (rank === 3) return 'text-amber-600';
    return 'text-gray-400';
  };

  const getRankBackground = (rank) => {
    if (rank === 1) return 'bg-yellow-500/10 border-yellow-500/20';
    if (rank === 2) return 'bg-gray-500/10 border-gray-500/20';
    if (rank === 3) return 'bg-amber-500/10 border-amber-500/20';
    return 'bg-gray-800/50 border-gray-700';
  };

  return (
    <Card className="console-leaderboard rounded-xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 accent-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            <span className="text-white">Leaderboard</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs text-gray-400">
              {rankings.length} users
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
        {/* Current User Rank */}
        {currentUserRank && (
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{currentUserRank.medal}</span>
                <div>
                  <div className="text-sm text-gray-400">Your Rank</div>
                  <div className="text-lg font-bold text-white">
                    #{currentUserRank.rank}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">Portfolio Value</div>
                <div className="text-lg font-bold text-white">
                  {formatCurrency(currentUserRank.portfolioValue)}
                </div>
                <div className={`text-sm ${currentUserRank.pnlPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatPercentage(currentUserRank.pnlPercent)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Top Rankings */}
        {isExpanded && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-300 mb-3">Top Performers</div>
            {rankings.slice(0, 10).map((rank, index) => (
              <div
                key={rank.userId}
                className={`p-3 rounded-lg border transition-all duration-200 ${
                  rank.userId === currentUserId 
                    ? 'bg-cyan-500/20 border-cyan-500/40' 
                    : getRankBackground(rank.rank)
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{rank.medal}</span>
                      <span className={`font-bold ${getRankColor(rank.rank)}`}>
                        #{rank.rank}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">
                        {rank.enrollmentNo}
                      </div>
                      {rank.changeText && (
                        <div className={`text-xs ${rank.changeColor}`}>
                          {rank.changeText}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-white">
                      {formatCurrency(rank.portfolioValue)}
                    </div>
                    <div className={`text-xs ${rank.pnlPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatPercentage(rank.pnlPercent)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {rank.tradesCount} trades
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Session Statistics */}
        {sessionStats && (
          <div className="pt-4 border-t border-gray-700">
            <div className="text-sm font-medium text-gray-300 mb-3">Session Stats</div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="text-center">
                <div className="text-gray-400">Total Users</div>
                <div className="text-white font-bold">{sessionStats.totalUsers}</div>
              </div>
              <div className="text-center">
                <div className="text-gray-400">Avg Value</div>
                <div className="text-white font-bold">
                  {formatCurrency(sessionStats.averageValue)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-400">Top Performer</div>
                <div className="text-white font-bold">
                  {sessionStats.topPerformer?.enrollmentNo || 'N/A'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-400">Biggest Gain</div>
                <div className="text-green-400 font-bold">
                  {formatPercentage(sessionStats.biggestGainer?.pnlPercent || 0)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Last Update */}
        {lastUpdate && (
          <div className="text-xs text-gray-500 text-center pt-2">
            Last updated: {new Date(lastUpdate).toLocaleTimeString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LeaderboardPanel;
