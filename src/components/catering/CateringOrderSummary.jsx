import React, { useMemo } from 'react';
import {
  Trash2,
  Plus,
  Minus,
  Tag,
  Receipt,
  Wallet,
  Save,
  ShoppingCart,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const CateringOrderSummary = ({
  selectedItems = {},
  onUpdateQuantity,
  onRemoveItem,
  onClearAll,
  discount = 0,
  discountType = 'fixed', // 'fixed' or 'percentage'
  onDiscountChange,
  onDiscountTypeChange,
  canProcessPayment = false,
  onProcessPayment,
  onSaveOrder,
  isSaving = false,
  itemCount = 0,
}) => {
  const itemsArray = useMemo(() => {
    return Object.values(selectedItems).filter(Boolean);
  }, [selectedItems]);

  const subtotal = useMemo(() => {
    return itemsArray.reduce((sum, item) => {
      const price = Number(item.price) || 0;
      const quantity = Number(item.quantity) || 0;
      return sum + price * quantity;
    }, 0);
  }, [itemsArray]);

  const discountAmount = useMemo(() => {
    const discountValue = Number(discount) || 0;
    if (discountType === 'percentage') {
      return (subtotal * discountValue) / 100;
    }
    return discountValue;
  }, [discount, discountType, subtotal]);

  const total = useMemo(() => {
    return Math.max(0, subtotal - discountAmount);
  }, [subtotal, discountAmount]);

  const handleQuantityChange = (item, delta) => {
    const newQuantity = Math.max(1, (item.quantity || 1) + delta);
    onUpdateQuantity?.(item.id, newQuantity);
  };

  if (itemsArray.length === 0) {
    return (
      <Card className="sticky top-4 border-2 border-dashed border-border/50 bg-gradient-to-br from-muted/30 via-card to-muted/20">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 relative">
            <div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full animate-pulse" />
            <div className="relative bg-gradient-to-br from-primary/20 to-primary/5 rounded-full p-6">
              <ShoppingCart
                className="h-12 w-12 text-primary/60"
                strokeWidth={1.5}
              />
            </div>
          </div>
          <CardTitle className="text-xl font-bold text-muted-foreground">
            Your Cart is Empty
          </CardTitle>
          <p className="text-sm text-muted-foreground/80 mt-2 max-w-[280px] mx-auto leading-relaxed">
            Start building your catering order by selecting delicious items from
            the menu
          </p>
        </CardHeader>
        <CardContent className="text-center pb-6">
          <div className="inline-flex items-center gap-2 text-xs text-primary/60 font-medium bg-primary/5 px-4 py-2 rounded-full">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Browse menu to get started</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="sticky top-4 overflow-hidden border-2 shadow-lg">
      {/* Gradient Header */}
      <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-b-2 border-primary/10">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <CardHeader className="relative pb-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 rounded-lg p-2">
                <ShoppingCart
                  className="h-5 w-5 text-primary"
                  strokeWidth={2}
                />
              </div>
              <div>
                <CardTitle className="text-lg font-bold">
                  Order Summary
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {itemsArray.length}{' '}
                  {itemsArray.length === 1 ? 'item' : 'items'} selected
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={onClearAll}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Clear
            </Button>
          </div>
        </CardHeader>
      </div>

      {/* Items List */}
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          <div className="space-y-2 p-4">
            {itemsArray.map((item, index) => {
              const unitPrice = Number(item.price) || 0;
              const quantity = Number(item.quantity) || 1;
              const itemTotal = unitPrice * quantity;

              return (
                <div
                  key={item.id}
                  className={cn(
                    'group relative overflow-hidden rounded-xl border-2 bg-gradient-to-br from-card to-muted/20 transition-all hover:shadow-md hover:border-primary/20',
                    index % 2 === 0
                      ? 'hover:from-card hover:to-primary/5'
                      : 'hover:from-card hover:to-accent/5'
                  )}
                >
                  <div className="p-3 space-y-2.5">
                    {/* Item Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm leading-tight line-clamp-2">
                          {item.name}
                        </h4>
                        {item.category && (
                          <Badge
                            variant="outline"
                            className="mt-1.5 text-[10px] h-5 px-2"
                          >
                            {item.category}
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                        onClick={() => onRemoveItem?.(item.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    {/* Quantity and Price */}
                    <div className="flex items-center justify-between gap-4 pt-1">
                      <div className="flex items-center gap-1.5 bg-muted/50 rounded-lg p-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 hover:bg-background"
                          onClick={() => handleQuantityChange(item, -1)}
                          disabled={quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-bold w-7 text-center px-1">
                          {quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 hover:bg-background"
                          onClick={() => handleQuantityChange(item, 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      <div className="text-right">
                        <div className="text-[10px] text-muted-foreground font-medium">
                          ₱{unitPrice.toFixed(2)} each
                        </div>
                        <div className="text-base font-bold text-primary">
                          ₱{itemTotal.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>

      {/* Discount Section */}
      <CardContent className="space-y-4 pt-4 pb-3">
        <div className="space-y-2.5">
          <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Tag className="h-3.5 w-3.5 text-primary" />
            Apply Discount
          </Label>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={discount}
                onChange={(e) => onDiscountChange?.(e.target.value)}
                className="h-10 border-2 focus-visible:border-primary"
              />
            </div>
            <Select value={discountType} onValueChange={onDiscountTypeChange}>
              <SelectTrigger className="w-24 h-10 border-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fixed">₱ Fixed</SelectItem>
                <SelectItem value="percentage">% Percent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Totals */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground font-medium">Subtotal</span>
            <span className="font-semibold">₱{subtotal.toFixed(2)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-green-600 font-medium flex items-center gap-1">
                <Tag className="h-3 w-3" />
                Discount
              </span>
              <span className="font-semibold text-green-600">
                -₱{discountAmount.toFixed(2)}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between pt-3 border-t-2 border-dashed">
            <span className="text-base font-bold">Total Amount</span>
            <span className="text-2xl font-bold text-primary">
              ₱{total.toFixed(2)}
            </span>
          </div>
        </div>
      </CardContent>

      {/* Action Buttons - Sticky Footer */}
      <div className="border-t-2 bg-gradient-to-br from-muted/30 to-background p-4 space-y-2">
        <Button
          onClick={onSaveOrder}
          disabled={isSaving || itemCount === 0}
          className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary via-primary to-primary/80 hover:from-primary/90 hover:via-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all"
          size="lg"
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
              Saving Order...
            </>
          ) : (
            <>
              <Save className="h-5 w-5 mr-2" />
              Save Order ({itemCount} {itemCount === 1 ? 'item' : 'items'})
            </>
          )}
        </Button>
        <Button
          onClick={() => onProcessPayment?.()}
          disabled={!canProcessPayment}
          variant="outline"
          className="w-full h-11 font-semibold border-2 hover:bg-primary/5"
        >
          <Wallet className="h-4 w-4 mr-2" />
          Process Payment
        </Button>
      </div>
    </Card>
  );
};

export default CateringOrderSummary;
