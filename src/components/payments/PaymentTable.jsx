import React from 'react';
import { 
  ArrowUpDown, 
  MoreVertical, 
  Download, 
  ArrowDownUp,
  Banknote,
  CreditCard,
  Smartphone,
  CircleDollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CustomBadge } from '@/components/ui/custom-badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const PaymentTable = ({ payments, getStatusBadgeVariant }) => {
  const getPaymentMethodIcon = (method) => {
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
            {payments.length > 0 ? (
              payments.map((payment) => (
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
                          <Download className="mr-2 h-4 w-4" /> Download Invoice
                        </DropdownMenuItem>
                        {payment.status === 'completed' && (
                          <DropdownMenuItem>
                            <ArrowDownUp className="mr-2 h-4 w-4" /> Process Refund
                          </DropdownMenuItem>
                        )}
                        {payment.status === 'failed' && (
                          <DropdownMenuItem>
                            <ArrowDownUp className="mr-2 h-4 w-4" /> Retry Payment
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