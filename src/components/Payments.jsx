import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

import PaymentFilter from './payments/PaymentFilter';
import PaymentTable from './payments/PaymentTable';
import PaymentSummary from './payments/PaymentSummary';
import RecentTransactions from './payments/RecentTransaction';
import PaymentMethods from './payments/PaymentMethods';

/**
 * Payments
 *
 * The top level container that manages state for all payment-related
 * UI. It holds the payments array, filter values and method
 * activation states. This component composes several smaller
 * components to render the search/filter controls, the payments
 * table, summary footer, recent transactions and method toggles.
 */
const Payments = () => {
  // Filter UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [dateRange, setDateRange] = useState('7d');

  // Payment method activation state
  const [methodActive, setMethodActive] = useState({
    cash: true,
    card: true,
    mobile: true,
  });

  // Demo payments data. In a real application this would come
  // from an API or database.
  const [payments] = useState([
    {
      id: '1',
      orderId: 'ORD-2581',
      amount: 45.75,
      date: '2025-04-17 10:32:15',
      method: 'card',
      status: 'completed',
      customer: 'John Doe',
    },
    {
      id: '2',
      orderId: 'ORD-2582',
      amount: 22.5,
      date: '2025-04-17 11:15:22',
      method: 'cash',
      status: 'completed',
      customer: undefined,
    },
    {
      id: '3',
      orderId: 'ORD-2583',
      amount: 38.9,
      date: '2025-04-17 12:25:40',
      method: 'mobile',
      status: 'completed',
      customer: 'Sarah Johnson',
    },
    {
      id: '4',
      orderId: 'ORD-2584',
      amount: 29.95,
      date: '2025-04-17 13:10:05',
      method: 'card',
      status: 'failed',
      customer: 'Alex Chen',
    },
    {
      id: '5',
      orderId: 'ORD-2585',
      amount: 52.35,
      date: '2025-04-17 14:27:51',
      method: 'mobile',
      status: 'completed',
      customer: 'Maria Lopez',
    },
    {
      id: '6',
      orderId: 'ORD-2586',
      amount: 18.25,
      date: '2025-04-17 15:45:12',
      method: 'cash',
      status: 'completed',
      customer: undefined,
    },
    {
      id: '7',
      orderId: 'ORD-2587',
      amount: 65.8,
      date: '2025-04-17 16:30:45',
      method: 'card',
      status: 'refunded',
      customer: 'David Brown',
    },
  ]);

  /**
   * compute filtered payments according to search text, selected status
   * and method activation flags. Filtering by dateRange is not
   * implemented; the state is retained for future enhancement.
   */
  const filteredPayments = payments.filter((payment) => {
    // Search by order ID or customer name
    const matchesSearch =
      payment.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (payment.customer &&
        payment.customer.toLowerCase().includes(searchTerm.toLowerCase()));

    // Status filter
    const matchesStatus = selectedStatus === 'all' || payment.status === selectedStatus;

    // Hide inactive methods if toggled off
    const methodIsActive = methodActive[payment.method] ?? true;

    return matchesSearch && matchesStatus && methodIsActive;
  });

  // Sort payments by date descending
  const sortedPayments = [...filteredPayments].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  // Total amount helper. Refunded transactions are excluded from totals.
  const getTotalAmount = (status = 'all') => {
    return payments
      .filter((p) => status === 'all' || p.status === status)
      .reduce((total, p) => {
        if (p.status === 'refunded') return total;
        return total + p.amount;
      }, 0)
      .toFixed(2);
  };

  // Event handlers for row actions. These could be extended to call
  // API endpoints to actually process refunds or retries.
  const handleProcessRefund = (payment) => {
    console.log('Process refund for', payment);
  };
  const handleRetryPayment = (payment) => {
    console.log('Retry payment for', payment);
  };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Left column: filters and table */}
      <div className="md:col-span-2 space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Payment Management</CardTitle>
              <CardDescription>Track and process payments</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Download className="h-4 w-4 mr-1" /> Export
              </Button>
              {/* Additional action buttons could be added here */}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <PaymentFilter
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedStatus={selectedStatus}
              setSelectedStatus={setSelectedStatus}
              dateRange={dateRange}
              setDateRange={setDateRange}
            />
            <PaymentTable
              sortedPayments={sortedPayments}
              onProcessRefund={handleProcessRefund}
              onRetryPayment={handleRetryPayment}
            />
          </CardContent>
          <CardFooter>
            <PaymentSummary
              totalVisible={sortedPayments.length}
              totalCount={payments.length}
              totalAmount={getTotalAmount(selectedStatus)}
            />
          </CardFooter>
        </Card>
      </div>
      {/* Right column: recent transactions and method toggles */}
      <div className="space-y-4">
        <RecentTransactions sortedPayments={sortedPayments} />
        <PaymentMethods methodActive={methodActive} setMethodActive={setMethodActive} />
      </div>
    </div>
  );
};

export default Payments;