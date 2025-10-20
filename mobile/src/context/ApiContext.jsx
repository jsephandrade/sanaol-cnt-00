import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { isMockMode, setMockMode, subscribeToApiEvents } from '../api/api';

const ApiContext = createContext({
  useMocks: false,
  setUseMocks: () => {},
  lastError: null,
  setLastError: () => {},
  lastEvent: null,
});

export function ApiProvider({ children }) {
  const [useMocks, setUseMocksState] = useState(isMockMode());
  const [lastError, setLastError] = useState(null);
  const [lastEvent, setLastEvent] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeToApiEvents((event) => {
      setLastEvent(event);
      if (event?.type === 'error') {
        setLastError(event.error);
      } else if (event?.type === 'success') {
        setLastError((prev) => (prev ? null : prev));
      }
    });
    return unsubscribe;
  }, []);

  const setUseMocks = useCallback((value) => {
    const next = Boolean(value);
    setUseMocksState(next);
    setMockMode(next);
  }, []);

  const value = useMemo(
    () => ({
      useMocks,
      setUseMocks,
      lastError,
      setLastError,
      lastEvent,
    }),
    [useMocks, setUseMocks, lastError, lastEvent]
  );

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
}

export function useApiConfig() {
  return useContext(ApiContext);
}
