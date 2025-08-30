import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import MenuSelection from '@/components/pos/MenuSelection';
import CurrentOrder from '@/components/pos/CurrentOrder';
import OrderQueue from '@/components/pos/OrderQueue';
import PaymentModal from '@/components/pos/PaymentModal';
import DiscountModal from '@/components/pos/DiscountModal';
import OrderHistoryModal from '@/components/pos/OrderHistoryModal';
import { MobileBottomBar } from '@/components/pos/MobileBottomBar';
import { usePOSData } from '@/hooks/usePOSData';
import { usePOSLogic } from '@/hooks/usePOSLogic';

const POS = () => {
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [isOrderHistoryModalOpen, setIsOrderHistoryModalOpen] = useState(false);
  const [discountInput, setDiscountInput] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [activeCategory, setActiveCategory] = useState('1');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(isMobile ? 'menu' : 'pos');
  const [isCartSheetOpen, setIsCartSheetOpen] = useState(false);
  const [isQueueSheetOpen, setIsQueueSheetOpen] = useState(false);

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
    <div className="space-y-4 pb-20 md:pb-4">
      {/* Desktop Layout */}
      {!isMobile ? (
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
            <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <MenuSelection
                  categories={categories}
                  activeCategory={activeCategory}
                  setActiveCategory={setActiveCategory}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  onAddToOrder={addToOrder}
                />
              </div>

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
      ) : (
        /* Mobile Layout */
        <div className="space-y-4">
          {/* Mobile Menu View */}
          {activeTab === 'menu' && (
            <MenuSelection
              categories={categories}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onAddToOrder={addToOrder}
              isMobile={true}
            />
          )}

          {/* Mobile Cart Sheet */}
          <Sheet open={isCartSheetOpen} onOpenChange={setIsCartSheetOpen}>
            <SheetContent side="right" className="w-full sm:max-w-md">
              <SheetHeader>
                <SheetTitle>Current Order</SheetTitle>
              </SheetHeader>
              <div className="mt-4">
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
                  isMobile={true}
                />
              </div>
            </SheetContent>
          </Sheet>

          {/* Mobile Queue Sheet */}
          <Sheet open={isQueueSheetOpen} onOpenChange={setIsQueueSheetOpen}>
            <SheetContent side="right" className="w-full sm:max-w-md">
              <SheetHeader>
                <SheetTitle>Order Queue</SheetTitle>
              </SheetHeader>
              <div className="mt-4">
                <OrderQueue
                  orderQueue={orderQueue}
                  updateOrderStatus={updateOrderStatus}
                  isMobile={true}
                />
              </div>
            </SheetContent>
          </Sheet>

          {/* Mobile Bottom Navigation */}
          <MobileBottomBar
            currentOrder={currentOrder}
            onShowCart={() => setIsCartSheetOpen(true)}
            onShowPayment={() => setIsPaymentModalOpen(true)}
            onShowQueue={() => setIsQueueSheetOpen(true)}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </div>
      )}

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
