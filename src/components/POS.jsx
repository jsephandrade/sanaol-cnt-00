import React, { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MenuSelection from '@/components/pos/MenuSelection';
import CurrentOrder from '@/components/pos/CurrentOrder';
import OrderQueue from '@/components/pos/OrderQueue';
import PaymentModal from '@/components/pos/PaymentModal';
import DiscountModal from '@/components/pos/DiscountModal';
import OrderHistoryModal from '@/components/pos/OrderHistoryModal';
import { usePOSData, EMPTY_QUEUE_STATE } from '@/hooks/usePOSData';
import { usePOSLogic } from '@/hooks/usePOSLogic';
import { useOrderHistory } from '@/hooks/useOrderManagement';
import { orderService } from '@/api/services/orderService';

const POS = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [isOrderHistoryModalOpen, setIsOrderHistoryModalOpen] = useState(false);
  const [discountInput, setDiscountInput] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [activeCategory, setActiveCategory] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('pos');

  // Get data and business logic from custom hooks
  const { categories, orderQueue, setOrderQueue } = usePOSData();
  const {
    orderHistory,
    loading: historyLoading,
    error: historyError,
    refetch: refetchHistory,
  } = useOrderHistory({}, { auto: false });
  useEffect(() => {
    if (!activeCategory && categories && categories.length > 0) {
      setActiveCategory(categories[0].id);
    }
  }, [categories, activeCategory]);
  const {
    currentOrder,
    discount,
    orderNumber,
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
  } = usePOSLogic();

  const hasOrderItems = Array.isArray(currentOrder) && currentOrder.length > 0;

  const handleApplyDiscount = () => {
    const success = applyDiscount(discountInput, discountType);
    if (success) {
      setIsDiscountModalOpen(false);
      setDiscountInput('');
    }
  };

  const refreshQueue = useCallback(async () => {
    try {
      const res = await orderService.getOrderQueue();
      if (res?.data) {
        setOrderQueue(res.data);
        return res.data;
      }
    } catch (e) {
      console.error(e);
    }
    setOrderQueue(EMPTY_QUEUE_STATE);
    return EMPTY_QUEUE_STATE;
  }, [setOrderQueue]);

  const handleProcessPayment = async (paymentDetails) => {
    const info = await processPayment(paymentMethod, paymentDetails);
    if (info?.id) {
      setIsPaymentModalOpen(false);
      setActiveTab('queue');

      const triggerQueueRefresh = () => {
        refreshQueue().catch((e) => console.error(e));
      };

      if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        window.requestIdleCallback(triggerQueueRefresh);
      } else {
        setTimeout(triggerQueueRefresh, 0);
      }

      return true;
    }
    return false;
  };

  const handleOpenPaymentModal = () => {
    if (!hasOrderItems) return;
    setIsPaymentModalOpen(true);
  };
  // Fetch order history only when modal opens
  useEffect(() => {
    if (isOrderHistoryModalOpen) refetchHistory();
  }, [isOrderHistoryModalOpen, refetchHistory]);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      await refreshQueue();
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const updateOrderItemState = async (orderId, itemId, payload) => {
    try {
      const res = await orderService.updateOrderItemState(
        orderId,
        itemId,
        payload
      );
      await refreshQueue();
      return res?.data ?? null;
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  // Poll queue periodically for real-time-ish updates
  useEffect(() => {
    let timer = null;
    let cancelled = false;
    const tick = async () => {
      try {
        await refreshQueue();
      } catch {
      } finally {
        if (!cancelled) timer = setTimeout(tick, 5000);
      }
    };
    tick();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [refreshQueue]);

  return (
    <div className="space-y-4">
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value)}
        className="w-full"
      >
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="pos">Point of Sale</TabsTrigger>
          <TabsTrigger value="queue">Order Queue</TabsTrigger>
        </TabsList>

        <TabsContent value="pos">
          <div
            className={`grid gap-4 grid-cols-1 ${hasOrderItems ? 'md:grid-cols-3' : 'md:grid-cols-1'}`}
          >
            <MenuSelection
              categories={categories}
              occupyFullWidth={!hasOrderItems}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onAddToOrder={addToOrder}
            />

            <CurrentOrder
              currentOrder={currentOrder}
              discount={discount}
              orderNumber={orderNumber}
              onUpdateQuantity={updateQuantity}
              onRemoveFromOrder={removeFromOrder}
              onClearOrder={clearOrder}
              onRemoveDiscount={removeDiscount}
              calculateSubtotal={calculateSubtotal}
              calculateDiscountAmount={calculateDiscountAmount}
              calculateTotal={calculateTotal}
              onOpenPaymentModal={handleOpenPaymentModal}
              onOpenDiscountModal={() => setIsDiscountModalOpen(true)}
              onOpenHistoryModal={() => setIsOrderHistoryModalOpen(true)}
            />
          </div>
        </TabsContent>

        <TabsContent value="queue">
          <OrderQueue
            orderQueue={orderQueue}
            refreshQueue={refreshQueue}
            updateOrderStatus={updateOrderStatus}
            updateOrderItemState={updateOrderItemState}
          />
        </TabsContent>
      </Tabs>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        currentOrder={currentOrder}
        discount={discount}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        onProcessPayment={handleProcessPayment}
        calculateSubtotal={calculateSubtotal}
        calculateDiscountAmount={calculateDiscountAmount}
        calculateTotal={calculateTotal}
      />

      <DiscountModal
        isOpen={isDiscountModalOpen}
        onClose={() => setIsDiscountModalOpen(false)}
        discountInput={discountInput}
        setDiscountInput={setDiscountInput}
        discountType={discountType}
        setDiscountType={setDiscountType}
        onApplyDiscount={handleApplyDiscount}
        calculateSubtotal={calculateSubtotal}
      />

      <OrderHistoryModal
        isOpen={isOrderHistoryModalOpen}
        onClose={() => setIsOrderHistoryModalOpen(false)}
        orderHistory={orderHistory}
        loading={historyLoading}
        error={historyError}
        onRefresh={refetchHistory}
      />
    </div>
  );
};

export default POS;
