import { createContext, useContext, useState, useEffect } from 'react';

import { useWebSocket } from '../lib/useWebSocket';
import { usePolling } from '../lib/usePolling';

const WebSocketContext = createContext(null);

export function WebSocketProvider({ userId, children }) {
  const [useFallback, setUseFallback] = useState(false);
  const ws = useWebSocket(userId);
  const polling = usePolling(userId);

  // Check if WebSocket is working after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!ws?.isConnected) {
        console.log('🔄 WebSocket not connected, switching to polling fallback');
        setUseFallback(true);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [ws?.isConnected]);

  // Use polling if WebSocket fails
  const data = useFallback ? polling : ws;

  return (
    <WebSocketContext.Provider value={data}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWS() {
  const ctx = useContext(WebSocketContext);
  return ctx;
}




