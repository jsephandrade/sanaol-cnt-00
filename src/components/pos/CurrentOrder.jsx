import React from 'react';
import { Button } from '@/components/ui/button';
import { formatOrderNumber } from '@/lib/utils';
import FeaturePanelCard from '@/components/shared/FeaturePanelCard';
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Tag,
  Receipt,
  X,
  Image as ImageIcon,
} from 'lucide-react';

const currencyFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
});

const formatCurrency = (value) => currencyFormatter.format(Number(value ?? 0));

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
  const orderLabel = orderNumber
    ? formatOrderNumber(orderNumber)
    : 'Pending Payment';

  if (!hasOrderItems) {
    return null;
  }

  const orderDescription = orderNumber
    ? `Order #${orderLabel}`
    : orderLabel || 'Pending Payment';
  const itemSummary = `${currentOrder.length} item${
    currentOrder.length === 1 ? '' : 's'
  } in cart`;

  return (
    <div className="md:col-span-1 md:self-start">
      <FeaturePanelCard
        className="flex h-full flex-col md:max-h-[80vh]"
        badgeIcon={ShoppingCart}
        badgeText="Current Order"
        title={orderDescription}
        description={itemSummary}
        contentClassName="flex flex-1 min-h-0 flex-col gap-5 !space-y-0"
      >
        <div className="flex-1 space-y-3 overflow-y-auto pr-1 min-h-0 md:max-h-[42vh] lg:max-h-[45vh]">
          {currentOrder.map((item) => {
            const lineTotal = formatCurrency(item.price * item.quantity);
            const unitPrice = formatCurrency(item.price);
            return (
              <div
                key={item.id}
                className="group relative flex items-center gap-2 overflow-hidden rounded-md border border-border/60 bg-background/80 p-1.5 shadow-sm"
              >
                {/* Background overlay */}
                {item.image ? (
                  <div
                    className="pointer-events-none absolute inset-0 z-0 scale-110 bg-cover bg-center opacity-25 blur-sm transition-opacity duration-300 group-hover:opacity-35"
                    style={{ backgroundImage: `url(${item.image})` }}
                  />
                ) : (
                  <div className="pointer-events-none absolute inset-0 z-0 bg-muted/40" />
                )}
                <div className="pointer-events-none absolute inset-0 z-0 bg-background/70 backdrop-blur-[2px]" />

                {/* Tiny thumbnail */}
                <div className="relative z-10 flex h-10 w-10 flex-shrink-0 overflow-hidden rounded border border-border/40 bg-background/60">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                      <ImageIcon className="h-4 w-4" aria-hidden="true" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="relative z-10 flex flex-1 flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium leading-tight text-foreground line-clamp-1">
                      {item.name}
                    </p>
                    <span className="text-xs font-semibold text-foreground">
                      {lineTotal}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-5 w-5"
                        onClick={() => onUpdateQuantity(item.id, -1)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-2.5 w-2.5" />
                      </Button>
                      <span className="text-xs font-medium text-foreground leading-none">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-5 w-5"
                        onClick={() => onUpdateQuantity(item.id, 1)}
                      >
                        <Plus className="h-2.5 w-2.5" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <span>{unitPrice} each</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 text-destructive hover:text-destructive"
                        onClick={() => onRemoveFromOrder(item.id)}
                      >
                        <Trash2 className="h-2.5 w-2.5" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="rounded-xl border border-border/60 bg-background/80 p-4 shadow-sm shrink-0">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Subtotal</span>
            <span>{formatCurrency(calculateSubtotal())}</span>
          </div>
          {discount.value > 0 && (
            <div className="mt-2 flex items-start justify-between text-sm text-emerald-600">
              <span className="flex items-center gap-1">
                Discount (
                {discount.type === 'percentage'
                  ? `${discount.value}%`
                  : formatCurrency(discount.value)}
                )
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 text-emerald-700 hover:text-emerald-800"
                  onClick={onRemoveDiscount}
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove discount</span>
                </Button>
              </span>
              <span>-{formatCurrency(calculateDiscountAmount())}</span>
            </div>
          )}
          <div className="mt-3 flex justify-between border-t pt-3 text-base font-semibold text-foreground">
            <span>Total</span>
            <span>{formatCurrency(calculateTotal())}</span>
          </div>
        </div>

        <div className="flex flex-col gap-3 shrink-0">
          <div className="flex gap-2">
            <Button
              className="flex-1"
              size="sm"
              variant="default"
              disabled={!hasOrderItems}
              onClick={onOpenPaymentModal}
            >
              <CreditCard className="mr-1 h-4 w-4" /> Pay
            </Button>
            <Button
              className="flex-1"
              size="sm"
              variant="outline"
              disabled={!hasOrderItems}
              onClick={onClearOrder}
            >
              <Trash2 className="mr-1 h-4 w-4" /> Clear
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" onClick={onOpenDiscountModal}>
              <Tag className="mr-1 h-4 w-4" /> Apply Discount
            </Button>
            <Button variant="outline" size="sm" onClick={onOpenHistoryModal}>
              <Receipt className="mr-1 h-4 w-4" /> Order History
            </Button>
          </div>
        </div>
      </FeaturePanelCard>
    </div>
  );
};

export default CurrentOrder;
