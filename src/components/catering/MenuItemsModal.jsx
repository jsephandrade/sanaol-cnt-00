import React, { useState } from 'react';
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
  const [activeCategory, setActiveCategory] = useState('1');
  const [paymentType, setPaymentType] = useState('downpayment');
  const [amountPaid, setAmountPaid] = useState('');

  // Sample categories - same as POS
  const categories = [
    {
      id: '1',
      name: 'Noodles',
      items: menuItems.filter((item) => item.category === 'Noodles'),
    },
    {
      id: '2',
      name: 'Sandwich',
      items: menuItems.filter((item) => item.category === 'Sandwich'),
    },
    {
      id: '3',
      name: 'Main Dish',
      items: menuItems.filter((item) => item.category === 'Main Dish'),
    },
    {
      id: '4',
      name: 'Viand',
      items: menuItems.filter((item) => item.category === 'Viand'),
    },
    {
      id: '5',
      name: 'Drinks',
      items: menuItems.filter((item) => item.category === 'Drinks'),
    },
    {
      id: '6',
      name: 'Combo Meals',
      items: menuItems.filter((item) => item.category === 'Combo Meals'),
    },
  ];

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

  const handleSave = () => {
    if (event) {
      const eventMenuItems = selectedItems.map((item) => ({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        price: item.price * item.quantity,
      }));

      onUpdateMenuItems(event.id, eventMenuItems);
      onOpenChange(false);
      clearOrder();
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={selectedItems.length === 0}>
            Save Menu Items & Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
