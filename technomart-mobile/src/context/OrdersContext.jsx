import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { fetchCurrentOrder, fetchOrderHistory, createSupportTicket } from '../utils/ordersApi';

const OrdersContext = createContext(undefined);

export function OrdersProvider({ children }) {
  const [currentOrder, setCurrentOrder] = useState(null);
  const [pastOrders, setPastOrders] = useState([]);
  const [loadingCurrent, setLoadingCurrent] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [error, setError] = useState(null);

  const loadCurrent = useCallback(async () => {
    setLoadingCurrent(true);
    try {
      const data = await fetchCurrentOrder();
      setCurrentOrder(data);
    } catch (err) {
      setError(err.message || 'Unable to fetch current order.');
    } finally {
      setLoadingCurrent(false);
    }
  }, []);

  const loadHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const data = await fetchOrderHistory();
      setPastOrders(data);
    } catch (err) {
      setError(err.message || 'Unable to fetch past orders.');
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  const refreshOrders = useCallback(async () => {
    await Promise.all([loadCurrent(), loadHistory()]);
  }, [loadCurrent, loadHistory]);

  useEffect(() => {
    refreshOrders();
  }, [refreshOrders]);

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
