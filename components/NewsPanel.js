import React, { useState, useEffect } from 'react';

import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';

export default function NewsPanel({ 
  newsEvents = [], 
  onNewsClick, 
  isVisible = true,
  className = '',
  loading = false,
}) {
  const [filter, setFilter] = useState('all'); // all, positive, negative, neutral
  const [expandedNews, setExpandedNews] = useState(null);

  const isExpired = (event) => {
    if (!event.expiresAt) return false;
    return new Date() > new Date(event.expiresAt);
  };

  console.log('📰 NewsPanel render:', { isVisible, newsEventsCount: newsEvents.length, loading });

  if (!isVisible) return null;

  const filteredNews = newsEvents.filter(event => {
    if (filter === 'all') return !isExpired(event);
    return event.impact === filter && !isExpired(event);
  });

  const getImpactColor = (impact) => {
    switch (impact) {
    case 'positive': return 'text-green-400 bg-green-900/20 border-green-500';
    case 'negative': return 'text-red-400 bg-red-900/20 border-red-500';
    case 'neutral': return 'text-gray-400 bg-gray-900/20 border-gray-500';
    default: return 'text-gray-400 bg-gray-900/20 border-gray-500';
    }
  };

  const getImpactIcon = (impact) => {
    switch (impact) {
    case 'positive': return '📈';
    case 'negative': return '📉';
    case 'neutral': return '📊';
    default: return '📊';
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const handleNewsClick = (event) => {
    if (onNewsClick) {
      onNewsClick(event);
    }
  };

  const toggleExpanded = (eventId) => {
    setExpandedNews(expandedNews === eventId ? null : eventId);
  };

  const getPriceImpactText = (priceImpact) => {
    if (!priceImpact || priceImpact === 0) return null;
    const sign = priceImpact > 0 ? '+' : '';
    return `${sign}${priceImpact.toFixed(1)}%`;
  };

  return (
    <Card className={`bg-gray-900 border-gray-700 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            📰 Market News
            <Badge variant="secondary" className="bg-gray-700 text-gray-300">
              {filteredNews.length}
            </Badge>
          </CardTitle>
          <div className="flex gap-1">
            <Button
              variant={filter === 'all' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilter('all')}
              className="text-xs px-2 py-1 h-6"
            >
              All
            </Button>
            <Button
              variant={filter === 'positive' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilter('positive')}
              className="text-xs px-2 py-1 h-6 text-green-400"
            >
              📈
            </Button>
            <Button
              variant={filter === 'negative' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilter('negative')}
              className="text-xs px-2 py-1 h-6 text-red-400"
            >
              📉
            </Button>
            <Button
              variant={filter === 'neutral' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilter('neutral')}
              className="text-xs px-2 py-1 h-6 text-gray-400"
            >
              📊
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="h-96">
          <div className="space-y-2 p-4">
            {loading ? (
              <div className="text-center py-8 text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto mb-2"></div>
                <p>Loading news events...</p>
              </div>
            ) : filteredNews.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📰</div>
                <p>No news events yet</p>
                <p className="text-sm">News will appear here as they're generated</p>
              </div>
            ) : (
              filteredNews.map((event) => (
                <div
                  key={event.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:bg-gray-800/50 ${
                    expandedNews === event.id ? 'bg-gray-800/30' : 'bg-gray-800/20'
                  }`}
                  onClick={() => handleNewsClick(event)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${getImpactColor(event.impact).split(' ')[0]}`} />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-white truncate">
                          {event.headline}
                        </span>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getImpactColor(event.impact)}`}
                        >
                          {getImpactIcon(event.impact)}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                        <span>{event.symbol}</span>
                        <span>•</span>
                        <span>{formatTime(event.createdAt)}</span>
                        {event.priceImpact && (
                          <>
                            <span>•</span>
                            <span className={`font-medium ${
                              event.priceImpact > 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {getPriceImpactText(event.priceImpact)}
                            </span>
                          </>
                        )}
                      </div>
                      
                      {event.content && (
                        <div className="text-xs text-gray-300 leading-relaxed">
                          {expandedNews === event.id ? (
                            <div>
                              <p className="mb-2">{event.content}</p>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleExpanded(event.id);
                                }}
                                className="text-xs p-0 h-auto text-gray-400 hover:text-white"
                              >
                                Show less
                              </Button>
                            </div>
                          ) : (
                            <div>
                              <p className="line-clamp-2">{event.content}</p>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleExpanded(event.id);
                                }}
                                className="text-xs p-0 h-auto text-gray-400 hover:text-white"
                              >
                                Read more
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
