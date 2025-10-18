import { createContext, useContext, useState, useEffect } from 'react';

import { useWebSocket } from '../lib/useWebSocket';
import { useSimplePolling } from '../lib/useSimplePolling';

const WebSocketContext = createContext(null);

export function WebSocketProvider({ userId, children }) {
  const [useFallback, setUseFallback] = useState(true); // Start with polling by default
  const ws = useWebSocket(userId);
  const polling = useSimplePolling(userId);

  // Try WebSocket first, but fallback quickly if it fails
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!ws?.isConnected) {
        console.log('🔄 WebSocket not connected, using polling fallback');
        setUseFallback(true);
      } else {
        console.log('✅ WebSocket connected, using WebSocket');
        setUseFallback(false);
      }
    }, 2000); // Only wait 2 seconds

    return () => clearTimeout(timer);
  }, [ws?.isConnected]);

  // Use polling by default, WebSocket if it works
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




