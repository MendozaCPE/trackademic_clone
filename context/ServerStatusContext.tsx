import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { registerServerStatusCallbacks } from '@/services/api';

interface ServerStatusContextType {
  isServerDown: boolean;
  reportServerError: () => void;
  clearServerError: () => void;
}

const ServerStatusContext = createContext<ServerStatusContextType>({
  isServerDown: false,
  reportServerError: () => {},
  clearServerError: () => {},
});

export function ServerStatusProvider({ children }: { children: ReactNode }) {
  const [isServerDown, setIsServerDown] = useState(false);

  const reportServerError = useCallback(() => setIsServerDown(true),  []);
  const clearServerError  = useCallback(() => setIsServerDown(false), []);

  // Wire the api.ts fetch wrapper to this context
  useEffect(() => {
    registerServerStatusCallbacks(reportServerError, clearServerError);
  }, [reportServerError, clearServerError]);

  return (
    <ServerStatusContext.Provider value={{ isServerDown, reportServerError, clearServerError }}>
      {children}
    </ServerStatusContext.Provider>
  );
}

export const useServerStatus = () => useContext(ServerStatusContext);
