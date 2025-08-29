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
import { X } from 'lucide-react';

const OrderHistoryModal = ({ isOpen, onClose, orderHistory }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>Order History</CardTitle>
            <CardDescription>Recent completed orders</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        {/* Make this section scrollable */}
        <CardContent className="flex-1 overflow-y-auto">
          <div className="space-y-4">
            {orderHistory.map((order) => (
              <div key={order.id} className="border rounded-md p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold">#{order.orderNumber}</h3>
                    <p className="text-sm text-muted-foreground">
                      {order.timestamp.toLocaleDateString()}{' '}
                      {order.timestamp.toLocaleTimeString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Payment: {order.paymentMethod}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₱{order.total.toFixed(2)}</p>
                  </div>
                </div>

                <div className="bg-muted/50 p-3 rounded-md">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span>
                        {item.quantity}x {item.name}
                      </span>
                      <span>₱{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>

        <CardFooter>
          <Button className="w-full" onClick={onClose}>
            Close
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default OrderHistoryModal;
