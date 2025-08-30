import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingCart, 
  CreditCard, 
  Clock,
  Menu
} from 'lucide-react';

export const MobileBottomBar = ({ 
  currentOrder, 
  onShowCart, 
  onShowPayment, 
  onShowQueue,
  activeTab,
  setActiveTab 
}) => {
  const orderCount = currentOrder?.items?.length || 0;
  const orderTotal = currentOrder?.total || 0;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 bg-background border-t md:hidden">
      <div className="grid grid-cols-4 gap-1 p-2">
        <Button
          variant={activeTab === 'menu' ? 'default' : 'ghost'}
          className="flex flex-col items-center gap-1 h-14"
          onClick={() => setActiveTab('menu')}
        >
          <Menu className="h-4 w-4" />
          <span className="text-xs">Menu</span>
        </Button>
        
        <Button
          variant={activeTab === 'cart' ? 'default' : 'ghost'}
          className="flex flex-col items-center gap-1 h-14 relative"
          onClick={() => {
            setActiveTab('cart');
            onShowCart();
          }}
        >
          <div className="relative">
            <ShoppingCart className="h-4 w-4" />
            {orderCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-4 w-4 text-xs p-0 flex items-center justify-center"
              >
                {orderCount}
              </Badge>
            )}
          </div>
          <span className="text-xs">Cart</span>
        </Button>
        
        <Button
          variant={activeTab === 'pay' ? 'default' : 'ghost'}
          className="flex flex-col items-center gap-1 h-14"
          onClick={() => {
            setActiveTab('pay');
            onShowPayment();
          }}
          disabled={orderCount === 0}
        >
          <CreditCard className="h-4 w-4" />
          <span className="text-xs">Pay</span>
        </Button>
        
        <Button
          variant={activeTab === 'queue' ? 'default' : 'ghost'}
          className="flex flex-col items-center gap-1 h-14"
          onClick={() => {
            setActiveTab('queue');
            onShowQueue();
          }}
        >
          <Clock className="h-4 w-4" />
          <span className="text-xs">Queue</span>
        </Button>
      </div>
      
      {orderTotal > 0 && (
        <div className="bg-primary text-primary-foreground px-4 py-2 text-center">
          <span className="text-sm font-medium">
            Total: ₱{orderTotal.toFixed(2)}
          </span>
        </div>
      )}
    </div>
  );
};