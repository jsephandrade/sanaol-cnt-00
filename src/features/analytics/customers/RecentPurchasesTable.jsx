import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { currency } from '../common/utils';
import { formatOrderNumber } from '@/lib/utils';

function getCustomerLabel(purchase) {
  if (!purchase) return 'Walk-in';
  const name = (purchase.customer ?? '').trim();
  if (name && name.toLowerCase() !== 'n/a') {
    return name;
  }
  return 'Walk-in';
}

function getOrderLabel(purchase) {
  if (!purchase) return 'N/A';
  const raw = purchase.orderNumber || purchase.orderId || '';
  const formatted = formatOrderNumber(raw);
  if (formatted) return formatted;
  if (raw) return raw;
  return 'N/A';
}

export default function RecentPurchasesTable({
  purchases,
  loading,
  error,
  className = '',
}) {
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Recent Purchases</CardTitle>
        <CardDescription>Latest customer transactions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Method</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-muted-foreground">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-destructive">
                    {error}
                  </TableCell>
                </TableRow>
              ) : purchases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-muted-foreground">
                    No recent purchases recorded.
                  </TableCell>
                </TableRow>
              ) : (
                purchases.map((purchase) => (
                  <TableRow key={purchase.id}>
                    <TableCell className="font-medium">
                      {getOrderLabel(purchase)}
                    </TableCell>
                    <TableCell>{getCustomerLabel(purchase)}</TableCell>
                    <TableCell className="capitalize">
                      {purchase.method}
                    </TableCell>
                    <TableCell className="text-right">
                      {currency(purchase.amount)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
