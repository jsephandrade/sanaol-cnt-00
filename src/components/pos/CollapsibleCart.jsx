import React, { useState } from 'react';
import { ShoppingCart, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import CurrentOrder from './CurrentOrder';

const CollapsibleCart = ({
  currentOrder,
  discount,
  onUpdateQuantity,
  onRemoveFromOrder,
  onClearOrder,
  onRemoveDiscount,
  calculateSubtotal,
  calculateDiscountAmount,
  calculateTotal,
  onOpenPaymentModal,
  onOpenDiscountModal,
  onOpenHistoryModal,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const totalItems = currentOrder.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      {/* Portrait mode - Cart icon with badge */}
      <div className="portrait:md:block landscape:hidden xl:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="fixed top-4 right-4 z-50 h-12 w-12 shadow-lg"
            >
              <div className="relative">
                <ShoppingCart className="h-6 w-6" />
                {totalItems > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {totalItems}
                  </Badge>
                )}
              </div>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:w-96">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Current Order
              </SheetTitle>
            </SheetHeader>
            <div className="mt-6 h-full">
              <CurrentOrder
                currentOrder={currentOrder}
                discount={discount}
                onUpdateQuantity={onUpdateQuantity}
                onRemoveFromOrder={onRemoveFromOrder}
                onClearOrder={onClearOrder}
                onRemoveDiscount={onRemoveDiscount}
                calculateSubtotal={calculateSubtotal}
                calculateDiscountAmount={calculateDiscountAmount}
                calculateTotal={calculateTotal}
                onOpenPaymentModal={() => {
                  onOpenPaymentModal();
                  setIsOpen(false);
                }}
                onOpenDiscountModal={() => {
                  onOpenDiscountModal();
                  setIsOpen(false);
                }}
                onOpenHistoryModal={() => {
                  onOpenHistoryModal();
                  setIsOpen(false);
                }}
                isInSheet={true}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Landscape mode - Regular full card */}
      <div className="portrait:md:hidden landscape:block xl:block">
        <CurrentOrder
          currentOrder={currentOrder}
          discount={discount}
          onUpdateQuantity={onUpdateQuantity}
          onRemoveFromOrder={onRemoveFromOrder}
          onClearOrder={onClearOrder}
          onRemoveDiscount={onRemoveDiscount}
          calculateSubtotal={calculateSubtotal}
          calculateDiscountAmount={calculateDiscountAmount}
          calculateTotal={calculateTotal}
          onOpenPaymentModal={onOpenPaymentModal}
          onOpenDiscountModal={onOpenDiscountModal}
          onOpenHistoryModal={onOpenHistoryModal}
        />
      </div>
    </>
  );
};

export default CollapsibleCart;