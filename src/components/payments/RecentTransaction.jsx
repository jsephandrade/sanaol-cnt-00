import React from 'react';
import {
  Check,
  X,
  ArrowDownUp,
  Calendar,
  Receipt,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { CustomBadge } from '@/components/ui/custom-badge';
import { getStatusBadgeVariant } from './PaymentTable';

/**
 * RecentTransactions
 *
 * Renders a card showing the five most recent payments. Status icons
 * are visually encoded with colours and icons based on the payment
 * status. When no transactions are present a placeholder message is
 * shown.
 *
 * Props:
 *  - sortedPayments: array of payment objects sorted by date
 */
const RecentTransactions = ({ sortedPayments }) => {
  // Helper to choose an icon and styling based on status
  const renderStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <Check className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <X className="h-4 w-4 text-red-600" />;
      case 'refunded':
        return <ArrowDownUp className="h-4 w-4 text-amber-600" />;
      case 'pending':
        return <Calendar className="h-4 w-4 text-gray-600" />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>View latest payment activities</CardDescription>
      </CardHeader>
      <CardContent>
        {sortedPayments.length > 0 ? (
          <div className="space-y-4">
            {sortedPayments.slice(0, 5).map((payment) => (
              <div
                key={payment.id}
                className="flex justify-between items-center border-b pb-2 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`rounded-full p-1 ${
                      payment.status === 'completed'
                        ? 'bg-green-100'
                        : payment.status === 'failed'
                          ? 'bg-red-100'
                          : payment.status === 'refunded'
                            ? 'bg-amber-100'
                            : 'bg-gray-100'
                    }`}
                  >
                    {renderStatusIcon(payment.status)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{payment.orderId}</span>
                      <CustomBadge
                        variant={getStatusBadgeVariant(payment.status)}
                        className="capitalize text-xs"
                      >
                        {payment.status}
                      </CustomBadge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {payment.customer ? payment.customer : 'Walk-in Customer'}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">₱{payment.amount.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground capitalize">
                    {payment.method}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <Receipt className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">
              No recent transactions to display
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentTransactions;