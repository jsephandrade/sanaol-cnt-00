import React from 'react';
import { CustomBadge } from '@/components/ui/custom-badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Banknote,
  CreditCard,
  Smartphone,
  CircleDollarSign,
  ArrowUpDown,
  MoreVertical,
  ArrowDownUp,
  Download,
} from 'lucide-react';

/**
 * Utility helpers to render icons and status variants.
 * Extracting these into functions improves readability and
 * prevents repeated switch statements in the table body. If
 * additional payment methods or statuses are introduced in the
 * future it is straightforward to update these helpers.
 */
export const getPaymentMethodIcon = (method) => {
  switch (method) {
    case 'cash':
      return <Banknote className="h-4 w-4" />;
    case 'card':
      return <CreditCard className="h-4 w-4" />;
    case 'mobile':
      return <Smartphone className="h-4 w-4" />;
    default:
      return <CircleDollarSign className="h-4 w-4" />;
  }
};

export const getStatusBadgeVariant = (status) => {
  switch (status) {
    case 'completed':
      return 'success';
    case 'pending':
      return 'secondary';
    case 'failed':
      return 'destructive';
    case 'refunded':
      return 'outline';
    default:
      return 'default';
  }
};

/**
 * PaymentTable
 *
 * A self contained table component that displays a list of payments
 * with sortable headers and per-row actions. The table body will
 * gracefully handle an empty data set by showing a message across
 * the full width. It intentionally omits the surrounding Card so
 * that consumers can decide how to wrap the table (e.g. inside
 * CardContent).
 *
 * Props:
 *  - sortedPayments: array of payment objects sorted by date
 *  - onProcessRefund: handler for refund action (optional)
 *  - onRetryPayment: handler for retry action (optional)
 */
const PaymentTable = ({ sortedPayments, onProcessRefund, onRetryPayment }) => {
  return (
    <div className="rounded-md border">
      <div className="relative w-full overflow-auto">
        <table className="w-full caption-bottom text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="h-10 px-4 text-left font-medium">
                <div className="flex items-center gap-1">
                  Order ID <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th className="h-10 px-4 text-left font-medium">
                <div className="flex items-center gap-1">
                  Date <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th className="h-10 px-4 text-left font-medium">Method</th>
              <th className="h-10 px-4 text-left font-medium">
                <div className="flex items-center gap-1">
                  Amount <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th className="h-10 px-4 text-left font-medium">Status</th>
              <th className="h-10 px-4 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedPayments.length > 0 ? (
              sortedPayments.map((payment) => (
                <tr
                  key={payment.id}
                  className="border-b transition-colors hover:bg-muted/50"
                >
                  <td className="p-4 align-middle font-medium">
                    {payment.orderId}
                  </td>
                    <td className="p-4 align-middle whitespace-nowrap">
                      {payment.date.split(' ')[0]}
                    </td>
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-2">
                        {getPaymentMethodIcon(payment.method)}
                        <span className="capitalize">{payment.method}</span>
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      ₱{payment.amount.toFixed(2)}
                    </td>
                    <td className="p-4 align-middle">
                      <CustomBadge
                        variant={getStatusBadgeVariant(payment.status)}
                        className="capitalize"
                      >
                        {payment.status}
                      </CustomBadge>
                    </td>
                    <td className="p-4 align-middle text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" /> Download
                            Invoice
                          </DropdownMenuItem>
                          {payment.status === 'completed' && (
                            <DropdownMenuItem onClick={() => onProcessRefund?.(payment)}>
                              <ArrowDownUp className="mr-2 h-4 w-4" /> Process
                              Refund
                            </DropdownMenuItem>
                          )}
                          {payment.status === 'failed' && (
                            <DropdownMenuItem onClick={() => onRetryPayment?.(payment)}>
                              <ArrowDownUp className="mr-2 h-4 w-4" /> Retry
                              Payment
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="h-24 text-center">
                  No transactions match your search criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentTable;