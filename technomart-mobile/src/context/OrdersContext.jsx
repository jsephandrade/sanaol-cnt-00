import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { fetchCurrentOrder, fetchOrderHistory, createSupportTicket } from '../utils/ordersApi';
import { connectRealtime } from '../utils/realtime';
import { useAuth } from './AuthContext';

const OrdersContext = createContext(undefined);

export function OrdersProvider({ children }) {
  const [currentOrder, setCurrentOrder] = useState(null);
  const [pastOrders, setPastOrders] = useState([]);
  const [loadingCurrent, setLoadingCurrent] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [error, setError] = useState(null);
  const { hydrated: authHydrated, isAuthenticated } = useAuth();
  const realtimeRef = useRef(null);

  const loadCurrent = useCallback(async () => {
    if (!isAuthenticated) {
      setCurrentOrder(null);
      return;
    }
    setLoadingCurrent(true);
    try {
      const data = await fetchCurrentOrder();
      setCurrentOrder(data);
    } catch (err) {
      const message = err?.message || 'Unable to fetch current order.';
      if (message !== 'Authentication required') {
        setError(message);
      }
    } finally {
      setLoadingCurrent(false);
    }
  }, [isAuthenticated]);

  const loadHistory = useCallback(async () => {
    if (!isAuthenticated) {
      setPastOrders([]);
      return;
    }
    setLoadingHistory(true);
    try {
      const data = await fetchOrderHistory();
      setPastOrders(data);
    } catch (err) {
      const message = err?.message || 'Unable to fetch past orders.';
      if (message !== 'Authentication required') {
        setError(message);
      }
    } finally {
      setLoadingHistory(false);
    }
  }, [isAuthenticated]);

  const refreshOrders = useCallback(async () => {
    await Promise.all([loadCurrent(), loadHistory()]);
  }, [loadCurrent, loadHistory]);

  useEffect(() => {
    if (!authHydrated) {
      return;
    }
    if (isAuthenticated) {
      refreshOrders();
    } else {
      setCurrentOrder(null);
      setPastOrders([]);
    }
  }, [authHydrated, isAuthenticated, refreshOrders]);

  useEffect(() => {
    if (!authHydrated) {
      return () => {};
    }
    if (realtimeRef.current) {
      realtimeRef.current.close();
      realtimeRef.current = null;
    }
    if (!isAuthenticated) {
      return () => {};
    }

    const connection = connectRealtime({
      onMessage: (payload) => {
        const event = payload?.event;
        if (typeof event !== 'string') return;
        if (event.startsWith('order.')) {
          refreshOrders();
        }
      },
      onStatusChange: (status) => {
        if (status === 'unauthorized') {
          if (realtimeRef.current) {
            realtimeRef.current.close();
            realtimeRef.current = null;
          }
        }
      },
    });

    realtimeRef.current = connection;

    return () => {
      connection?.close();
      if (realtimeRef.current === connection) {
        realtimeRef.current = null;
      }
    };
  }, [authHydrated, isAuthenticated, refreshOrders]);

  const contactSupport = useCallback((orderId) => createSupportTicket(orderId), []);

  const value = useMemo(
    () => ({
      currentOrder,
      pastOrders,
      loadingCurrent,
      loadingHistory,
      refreshOrders,
      contactSupport,
      error,
    }),
    [currentOrder, pastOrders, loadingCurrent, loadingHistory, refreshOrders, contactSupport, error]
  );

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}

export function useOrders() {
  const ctx = useContext(OrdersContext);
  if (ctx === undefined) {
    throw new Error('useOrders must be used within an OrdersProvider');
  }
  return ctx;
}
