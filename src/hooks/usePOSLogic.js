import { useState } from 'react';
import { orderService } from '@/api/services/orderService';

export const usePOSLogic = () => {
  const [currentOrder, setCurrentOrder] = useState([]);
  const [discount, setDiscount] = useState({ type: 'percentage', value: 0 });
  const [orderInfo, setOrderInfo] = useState(null);

  const resetOrderInfo = () => setOrderInfo(null);

  const extractOrderInfo = (data) => {
    if (!data || typeof data !== 'object') return null;
    const id = data.id || data.orderId || data.orderID || data.order_id || null;
    const orderNumber =
      data.orderNumber ||
      data.order_number ||
      data.number ||
      data.orderNo ||
      null;
    if (!id || !orderNumber) return null;
    return { id, orderNumber };
  };

  const addToOrder = (menuItem) => {
    resetOrderInfo();
    setCurrentOrder((prevOrder) => {
      const existingItemIndex = prevOrder.findIndex(
        (item) => item.menuItemId === menuItem.id
      );

      if (existingItemIndex !== -1) {
        const updatedOrder = [...prevOrder];
        updatedOrder[existingItemIndex].quantity += 1;
        return updatedOrder;
      } else {
        return [
          ...prevOrder,
          {
            id: `order-item-${Date.now()}`,
            menuItemId: menuItem.id,
            name: menuItem.name,
            price: menuItem.price,
            quantity: 1,
          },
        ];
      }
    });
  };

  const updateQuantity = (orderItemId, change) => {
    resetOrderInfo();
    setCurrentOrder((prevOrder) => {
      const updatedOrder = prevOrder.map((item) => {
        if (item.id === orderItemId) {
          const newQuantity = item.quantity + change;
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
        }
        return item;
      });
      return updatedOrder;
    });
  };

  const removeFromOrder = (orderItemId) => {
    resetOrderInfo();
    setCurrentOrder((prevOrder) =>
      prevOrder.filter((item) => item.id !== orderItemId)
    );
  };

  const clearOrder = () => {
    resetOrderInfo();
    setCurrentOrder([]);
    setDiscount({ type: 'percentage', value: 0 });
  };

  const calculateSubtotal = () => {
    return currentOrder.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  };

  const calculateDiscountAmount = () => {
    const subtotal = calculateSubtotal();
    if (discount.type === 'percentage') {
      return (subtotal * discount.value) / 100;
    } else {
      return Math.min(discount.value, subtotal);
    }
  };

  const calculateTotal = () => {
    return Math.max(0, calculateSubtotal() - calculateDiscountAmount());
  };

  const applyDiscount = (discountInput, discountType) => {
    const value = parseFloat(discountInput);
    if (isNaN(value) || value < 0) {
      alert('Please enter a valid discount value');
      return false;
    }

    if (discountType === 'percentage' && value > 100) {
      alert('Percentage discount cannot exceed 100%');
      return false;
    }

    setDiscount({ type: discountType, value });
    return true;
  };

  const removeDiscount = () => {
    setDiscount({ type: 'percentage', value: 0 });
  };

  const ensureOrderCreated = async () => {
    if (!currentOrder.length) {
      alert('No items in order.');
      return null;
    }
    if (orderInfo && orderInfo.id && orderInfo.orderNumber) {
      return orderInfo;
    }
    try {
      // Create order in backend
      const payload = {
        items: currentOrder.map((it) => ({
          menuItemId: it.menuItemId,
          quantity: it.quantity,
        })),
        discount: discount?.type === 'fixed' ? discount.value : 0,
        type: 'walk-in',
      };
      const res = await orderService.createOrder(payload);
      const data = res?.data ?? res;
      const info = extractOrderInfo(data);
      if (!info) throw new Error('Order was not created');
      setOrderInfo(info);
      return info;
    } catch (e) {
      console.error(e);
      alert('Failed to create order. Please try again.');
      return null;
    }
  };

  const processPayment = async (paymentMethod) => {
    const total = calculateTotal();
    if (!currentOrder.length) {
      alert('No items in order.');
      return false;
    }
    const info = await ensureOrderCreated();
    if (!info?.id) {
      return false;
    }
    try {
      await orderService.processPayment(info.id, {
        amount: total,
        method: paymentMethod,
      });
      clearOrder();
      return true;
    } catch (e) {
      console.error(e);
      alert('Failed to process payment. Please try again.');
      return false;
    }
  };

  return {
    currentOrder,
    discount,
    orderInfo,
    addToOrder,
    updateQuantity,
    removeFromOrder,
    clearOrder,
    calculateSubtotal,
    calculateDiscountAmount,
    calculateTotal,
    applyDiscount,
    removeDiscount,
    processPayment,
    ensureOrderCreated,
  };
};
