import React, { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { X, Calendar, Users, ShoppingBag, Sparkles } from 'lucide-react';
import CateringMenuSelection from './CateringMenuSelection';
import CurrentCateringOrder from './CurrentCateringOrder';

export const MenuItemsModal = ({
  open,
  onOpenChange,
  event,
  menuItems,
  onUpdateMenuItems,
}) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [paymentType, setPaymentType] = useState('downpayment');
  const [amountPaid, setAmountPaid] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    const existingItems = (event?.items || []).map((item) => ({
      id: `existing-${item.id || item.menuItemId || Math.random()}`,
      menuItemId: item.menuItemId || item.menu_item_id || null,
      name: item.name,
      price: Number(item.unitPrice ?? item.unit_price ?? item.price ?? 0),
      quantity: Number(item.quantity ?? 1),
    }));
    setSelectedItems(existingItems);
    setPaymentType('downpayment');
    setAmountPaid('');
  }, [open, event?.id, event?.items]);

  const normalizedMenuItems = useMemo(() => {
    const getCategoryName = (category) => {
      if (!category) return 'Uncategorized';
      if (typeof category === 'string') return category;
      if (typeof category === 'object') {
        return (
          category.name ||
          category.label ||
          category.title ||
          category.slug ||
          category.id ||
          'Uncategorized'
        );
      }
      return String(category);
    };

    const toNumber = (value) => {
      const num = Number(value ?? 0);
      return Number.isFinite(num) ? num : 0;
    };

    return (menuItems || []).map((item) => ({
      ...item,
      category: getCategoryName(item.category),
      price: toNumber(item.price ?? item.unitPrice ?? item.basePrice),
      description: item.description || '',
    }));
  }, [menuItems]);

  const categories = useMemo(() => {
    if (!normalizedMenuItems.length) return [];

    const slugify = (value) =>
      String(value || 'uncategorized')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || 'uncategorized';

    const grouped = new Map();

    normalizedMenuItems.forEach((item) => {
      const name = item.category || 'Uncategorized';
      const slug = slugify(name);
      if (!grouped.has(slug)) {
        grouped.set(slug, { id: slug, name, items: [] });
      }
      grouped.get(slug).items.push(item);
    });

    const sorted = Array.from(grouped.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    return [
      {
        id: 'all',
        name: 'All',
        items: normalizedMenuItems,
      },
      ...sorted,
    ];
  }, [normalizedMenuItems]);

  useEffect(() => {
    if (!categories.length) {
      setActiveCategory('all');
      return;
    }

    if (!categories.some((category) => category.id === activeCategory)) {
      setActiveCategory(categories[0].id);
    }
  }, [categories, activeCategory]);

  const addToOrder = (menuItem) => {
    setSelectedItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (item) => item.menuItemId === menuItem.id
      );

      if (existingItemIndex !== -1) {
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += 1;
        return updatedItems;
      } else {
        return [
          ...prevItems,
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

  const updateQuantity = (itemId, change) => {
    setSelectedItems((prevItems) => {
      return prevItems
        .map((item) => {
          if (item.id === itemId) {
            const newQuantity = item.quantity + change;
            return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
          }
          return item;
        })
        .filter((item) => item.quantity > 0);
    });
  };

  const removeItem = (itemId) => {
    setSelectedItems((prevItems) =>
      prevItems.filter((item) => item.id !== itemId)
    );
  };

  const clearOrder = () => {
    setSelectedItems([]);
    setAmountPaid('');
  };

  const calculateSubtotal = () => {
    return selectedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  };

  const calculateDownpayment = () => {
    return calculateSubtotal() * 0.5;
  };

  const calculateBalance = () => {
    const subtotal = calculateSubtotal();
    const paidAmount = parseFloat(amountPaid) || 0;

    if (paymentType === 'full') {
      return subtotal - paidAmount;
    } else {
      return subtotal - paidAmount;
    }
  };

  const handleSave = async () => {
    if (!event || isSaving) return;

    setIsSaving(true);
    try {
      const eventMenuItems = selectedItems.map((item) => ({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        unitPrice: item.price,
      }));

      const success = await onUpdateMenuItems(event.id, eventMenuItems);
      if (success) {
        onOpenChange(false);
        clearOrder();
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (!event) return null;

  const totalItems = selectedItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
  const subtotal = calculateSubtotal();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden p-0 gap-0">
        {/* Enhanced Header with Event Details */}
        <DialogHeader className="px-6 pt-6 pb-4 space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="gap-1.5 px-3 py-1">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span className="font-medium">Catering Event</span>
                </Badge>
                <Badge variant="outline" className="gap-1.5">
                  <Calendar className="h-3 w-3" />
                  <span className="text-xs">
                    {new Date(event.eventDate || Date.now()).toLocaleDateString(
                      'en-US',
                      {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      }
                    )}
                  </span>
                </Badge>
                <Badge variant="outline" className="gap-1.5">
                  <Users className="h-3 w-3" />
                  <span className="text-xs">{event.attendees} guests</span>
                </Badge>
              </div>
              <DialogTitle className="text-2xl font-bold tracking-tight">
                {event.name}
              </DialogTitle>
              {event.venue && (
                <p className="text-sm text-muted-foreground">
                  📍 {event.venue}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="shrink-0 rounded-full h-9 w-9 hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Order Summary Bar */}
          {selectedItems.length > 0 && (
            <div className="flex items-center gap-4 p-3 bg-primary/5 rounded-lg border border-primary/10">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <ShoppingBag className="h-5 w-5 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-foreground">
                    {totalItems} {totalItems === 1 ? 'item' : 'items'} selected
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Total: PHP {subtotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </DialogHeader>

        <Separator />

        {/* Main Content Area */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3 h-[calc(95vh-280px)] px-6 py-4">
          <div className="lg:col-span-2 overflow-y-auto scrollbar-hide">
            {categories.length ? (
              <CateringMenuSelection
                categories={categories}
                activeCategory={activeCategory}
                setActiveCategory={setActiveCategory}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                onAddToOrder={addToOrder}
                eventName={event.name}
                attendees={event.attendees}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
                  <ShoppingBag className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  No menu items available
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Please add items to your menu in Menu Management before
                  creating catering orders.
                </p>
              </div>
            )}
          </div>

          <div className="lg:col-span-1 overflow-y-auto scrollbar-hide">
            <CurrentCateringOrder
              selectedItems={selectedItems}
              paymentType={paymentType}
              amountPaid={amountPaid}
              onUpdateQuantity={updateQuantity}
              onRemoveItem={removeItem}
              onClearOrder={clearOrder}
              onPaymentTypeChange={setPaymentType}
              onAmountPaidChange={setAmountPaid}
              calculateSubtotal={calculateSubtotal}
              calculateDownpayment={calculateDownpayment}
              calculateBalance={calculateBalance}
            />
          </div>
        </div>

        <Separator />

        {/* Enhanced Footer with Floating Actions */}
        <DialogFooter className="px-6 py-4 bg-muted/30">
          <div className="flex items-center justify-between w-full gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {selectedItems.length === 0 ? (
                <span>Select items to continue</span>
              ) : (
                <span className="font-medium text-foreground">
                  Ready to save {totalItems}{' '}
                  {totalItems === 1 ? 'item' : 'items'}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={isSaving}
                className="min-w-[100px]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={selectedItems.length === 0 || isSaving}
                className="min-w-[140px] shadow-md"
                size="lg"
              >
                {isSaving ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Saving...
                  </>
                ) : (
                  <>
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Save Order
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
