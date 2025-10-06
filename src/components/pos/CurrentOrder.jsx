import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Tag,
  Receipt,
  X,
} from 'lucide-react';

const CurrentOrder = ({
  currentOrder,
  discount,
  orderNumber,
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
  const hasOrderItems = Array.isArray(currentOrder) && currentOrder.length > 0;

  if (!hasOrderItems) {
    return null;
  }

  return (
    <div className="md:col-span-1 md:self-start">
      <Card className="flex flex-col md:max-h-[80vh]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Current Order
          </CardTitle>
          <CardDescription>
            Order #{orderNumber ? orderNumber : 'Pending'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto">
          <div className="space-y-3">
            {currentOrder.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-start p-2 border rounded-md"
              >
                <div className="flex-1">
                  <p className="font-medium">{item.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => onUpdateQuantity(item.id, -1)}
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="text-sm">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => onUpdateQuantity(item.id, 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive"
                      onClick={() => onRemoveFromOrder(item.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="text-right">
                  <p>₱{(item.price * item.quantity).toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">
                    ₱{item.price.toFixed(2)} each
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>₱{calculateSubtotal().toFixed(2)}</span>
            </div>
            {discount.value > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span className="flex items-center gap-1">
                  Discount (
                  {discount.type === 'percentage'
                    ? `${discount.value}%`
                    : `₱${discount.value}`}
                  )
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 text-red-500 hover:text-red-700"
                    onClick={onRemoveDiscount}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </span>
                <span>-₱{calculateDiscountAmount().toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-base pt-2 border-t">
              <span>Total</span>
              <span>₱{calculateTotal().toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-4 flex flex-col gap-3">
          <div className="flex gap-2 w-full">
            <Button
              className="flex-1"
              size="sm"
              variant="default"
              disabled={!hasOrderItems}
              onClick={onOpenPaymentModal}
            >
              <CreditCard className="h-4 w-4 mr-1" /> Pay
            </Button>
            <Button
              className="flex-1"
              size="sm"
              variant="outline"
              disabled={!hasOrderItems}
              onClick={onClearOrder}
            >
              <Trash2 className="h-4 w-4 mr-1" /> Clear
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2 w-full">
            <Button variant="outline" size="sm" onClick={onOpenDiscountModal}>
              <Tag className="h-4 w-4 mr-1" /> Apply Discount
            </Button>
            <Button variant="outline" size="sm" onClick={onOpenHistoryModal}>
              <Receipt className="h-4 w-4 mr-1" /> Order History
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CurrentOrder;
