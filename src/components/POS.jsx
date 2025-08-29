import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MenuSelection from '@/components/pos/MenuSelection';
import CurrentOrder from '@/components/pos/CurrentOrder';
import OrderQueue from '@/components/pos/OrderQueue';
import PaymentModal from '@/components/pos/PaymentModal';
import DiscountModal from '@/components/pos/DiscountModal';
import OrderHistoryModal from '@/components/pos/OrderHistoryModal';
import { usePOSData } from '@/hooks/usePOSData';
import { usePOSLogic } from '@/hooks/usePOSLogic';

const POS = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [isOrderHistoryModalOpen, setIsOrderHistoryModalOpen] = useState(false);
  const [discountInput, setDiscountInput] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [activeCategory, setActiveCategory] = useState('1');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('pos');

  // Get data and business logic from custom hooks
  const { orderHistory, categories, orderQueue, setOrderQueue } = usePOSData();
  const {
    currentOrder,
    discount,
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

  const handleApplyDiscount = () => {
    const success = applyDiscount(discountInput, discountType);
    if (success) {
      setIsDiscountModalOpen(false);
      setDiscountInput('');
    }
  };

  const handleProcessPayment = () => {
    const success = processPayment(paymentMethod);
    if (success) {
      setIsPaymentModalOpen(false);
    }
  };

  const updateOrderStatus = (orderId, newStatus) => {
    setOrderQueue((prevQueue) =>
      prevQueue.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };


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
          <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
            <MenuSelection
              categories={categories}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onAddToOrder={addToOrder}
            />

            <CurrentOrder
              currentOrder={currentOrder}
              discount={discount}
              onUpdateQuantity={updateQuantity}
              onRemoveFromOrder={removeFromOrder}
              onClearOrder={clearOrder}
              onRemoveDiscount={removeDiscount}
              calculateSubtotal={calculateSubtotal}
              calculateDiscountAmount={calculateDiscountAmount}
              calculateTotal={calculateTotal}
              onOpenPaymentModal={() => setIsPaymentModalOpen(true)}
              onOpenDiscountModal={() => setIsDiscountModalOpen(true)}
              onOpenHistoryModal={() => setIsOrderHistoryModalOpen(true)}
            />
          </div>
        </TabsContent>

        <TabsContent value="queue">
          <OrderQueue
            orderQueue={orderQueue}
            updateOrderStatus={updateOrderStatus}
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
      />
    </div>
  );
};

export default POS;
