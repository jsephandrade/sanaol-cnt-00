import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

const CartContext = createContext(undefined);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [orderType, setOrderType] = useState(null);

  const addItem = useCallback(({ item, extras = [], notes = '', quantity = 1 }) => {
    if (!item) return;
    const normalizedExtras = extras.map((extra) => ({
      key: extra.key,
      label: extra.label,
      price: extra.price ?? 0,
    }));
    const extrasKey =
      normalizedExtras
        .map((extra) => extra.key)
        .sort()
        .join('|') || 'plain';
    const noteKey = notes.trim();
    const variantKey = `${item.id ?? item.title}-${extrasKey}-${noteKey || 'noNote'}`;

    setItems((prev) => {
      const existingIndex = prev.findIndex((entry) => entry.variantKey === variantKey);
      if (existingIndex >= 0) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + quantity,
        };
        return next;
      }

      const basePrice = item.price ?? 0;
      const extrasTotal = normalizedExtras.reduce((sum, extra) => sum + extra.price, 0);

      return [
        ...prev,
        {
          variantKey,
          id: item.id,
          title: item.title,
          image: item.image,
          restaurant: item.restaurant ?? null,
          basePrice,
          extras: normalizedExtras,
          extrasTotal,
          notes: noteKey,
          quantity,
        },
      ];
    });
  }, []);

  const updateItemQuantity = useCallback((variantKey, quantity) => {
    setItems((prev) =>
      prev
        .map((item) =>
          item.variantKey === variantKey ? { ...item, quantity: Math.max(0, quantity) } : item
        )
        .filter((item) => item.quantity > 0)
    );
  }, []);

  const removeItem = useCallback((variantKey) => {
    setItems((prev) => prev.filter((item) => item.variantKey !== variantKey));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setOrderType(null);
  }, []);

  const updateOrderType = useCallback((nextOrderType) => {
    setOrderType(nextOrderType);
  }, []);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + (item.basePrice + item.extrasTotal) * item.quantity, 0),
    [items]
  );

  const totalItems = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);

  const value = useMemo(
    () => ({
      items,
      orderType,
      addItem,
      updateItemQuantity,
      removeItem,
      clearCart,
      updateOrderType,
      subtotal,
      totalItems,
    }),
    [
      items,
      orderType,
      addItem,
      updateItemQuantity,
      removeItem,
      clearCart,
      updateOrderType,
      subtotal,
      totalItems,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (ctx === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return ctx;
}
