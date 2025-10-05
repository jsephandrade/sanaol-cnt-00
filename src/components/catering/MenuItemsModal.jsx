import React, { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Menu Items Selection</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 grid-cols-1 lg:grid-cols-3 h-[calc(90vh-200px)]">
          <div className="lg:col-span-2">
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
              <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
                No menu items available. Please add items to the menu first.
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
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

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={selectedItems.length === 0 || isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Menu Items & Payment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
