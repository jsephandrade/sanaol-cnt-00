import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

const CheckoutContext = createContext(undefined);

const DEFAULT_SELECTION = Object.freeze({
  method: 'cash',
  status: 'idle',
  metadata: null,
});

export function CheckoutProvider({ children }) {
  const [selection, setSelection] = useState(DEFAULT_SELECTION);
  const [lastCompletedPayment, setLastCompletedPayment] = useState(null);

  const beginCheckout = useCallback(() => {
    setSelection((prev) => {
      const method = prev.method ?? DEFAULT_SELECTION.method;
      return {
        method,
        status: 'selecting',
        metadata: null,
      };
    });
  }, []);

  const selectPaymentMethod = useCallback((method) => {
    setSelection((prev) => {
      const resolvedMethod = method ?? DEFAULT_SELECTION.method;
      if (prev.method === resolvedMethod && prev.status === 'selecting') {
        return prev;
      }
      return {
        ...prev,
        method: resolvedMethod,
        status: prev.status === 'idle' ? 'selecting' : prev.status,
      };
    });
  }, []);

  const markPaymentStatus = useCallback((status, metadata = null) => {
    setSelection((prev) => {
      const next = {
        ...prev,
        status,
        metadata: metadata ?? prev.metadata,
      };

      if (status === 'authorized' || status === 'completed') {
        setLastCompletedPayment({
          method: next.method,
          status,
          metadata: next.metadata,
          timestamp: Date.now(),
        });
      }

      return next;
    });
  }, []);

  const resetCheckout = useCallback(() => {
    setSelection((prev) => ({
      method: prev.method ?? DEFAULT_SELECTION.method,
      status: 'idle',
      metadata: null,
    }));
  }, []);

  const completeCheckout = useCallback((metadata = null) => {
    setSelection((prev) => {
      const next = {
        ...prev,
        status: 'completed',
        metadata: metadata ?? prev.metadata,
      };

      setLastCompletedPayment({
        method: next.method,
        status: 'completed',
        metadata: next.metadata,
        timestamp: Date.now(),
      });

      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      paymentMethod: selection.method ?? DEFAULT_SELECTION.method,
      paymentStatus: selection.status,
      paymentMetadata: selection.metadata,
      lastCompletedPayment,
      beginCheckout,
      selectPaymentMethod,
      markPaymentStatus,
      resetCheckout,
      completeCheckout,
    }),
    [
      selection.method,
      selection.status,
      selection.metadata,
      lastCompletedPayment,
      beginCheckout,
      selectPaymentMethod,
      markPaymentStatus,
      resetCheckout,
      completeCheckout,
    ],
  );

  return <CheckoutContext.Provider value={value}>{children}</CheckoutContext.Provider>;
}

export function useCheckout() {
  const context = useContext(CheckoutContext);
  if (context === undefined) {
    throw new Error('useCheckout must be used within a CheckoutProvider');
  }
  return context;
}
