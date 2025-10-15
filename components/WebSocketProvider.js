import { createContext, useContext } from 'react';

import { useWebSocket } from '../lib/useWebSocket';

const WebSocketContext = createContext(null);

export function WebSocketProvider({ userId, children }) {
  const ws = useWebSocket(userId);
  return (
    <WebSocketContext.Provider value={ws}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWS() {
  const ctx = useContext(WebSocketContext);
  return ctx;
}




