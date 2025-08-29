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
import { CustomBadge } from '@/components/ui/custom-badge';
import {
  CreditCard,
  Search,
  Download,
  Receipt,
  ArrowUpDown,
  MoreVertical,
  Calendar,
  Check,
  X,
  ArrowDownUp,
  Banknote,
  Smartphone,
  CircleDollarSign,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
// Removed Tabs imports since we no longer show Settings
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch'; // NEW

const Payments = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [dateRange, setDateRange] = useState('7d');

  // Local state for payment method activation
  const [methodActive, setMethodActive] = useState({
    cash: true,
    card: true,
    mobile: true,
  });

  const [payments, setPayments] = useState([
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

  const getStatusBadgeVariant = (status) => {
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

  const getTotalAmount = (status = 'all') => {
    return payments
      .filter((payment) => status === 'all' || payment.status === status)
      .reduce((total, payment) => {
        if (payment.status === 'refunded') return total;
        return total + payment.amount;
      }, 0)
      .toFixed(2);
  };

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (payment.customer &&
        payment.customer.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      selectedStatus === 'all' || payment.status === selectedStatus;

    // Optional: if you want inactive methods to be hidden from lists
    const methodIsActive = methodActive[payment.method] ?? true;

    return matchesSearch && matchesStatus && methodIsActive;
  });

  const sortedPayments = [...filteredPayments].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="md:col-span-2 space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Payment Management</CardTitle>
              <CardDescription>Track and process payments</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                <Download className="h-4 w-4 mr-1" /> Export
              </Button>
              {/* Filter button removed */}
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex flex-col space-y-2 md:flex-row md:space-x-2 md:space-y-0">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by order ID or customer..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

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
                      <th className="h-10 px-4 text-left font-medium">
                        Method
                      </th>
                      <th className="h-10 px-4 text-left font-medium">
                        <div className="flex items-center gap-1">
                          Amount <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </th>
                      <th className="h-10 px-4 text-left font-medium">
                        Status
                      </th>
                      <th className="h-10 px-4 text-right font-medium">
                        Actions
                      </th>
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
                              <span className="capitalize">
                                {payment.method}
                              </span>
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
                                  <DropdownMenuItem>
                                    <ArrowDownUp className="mr-2 h-4 w-4" />{' '}
                                    Process Refund
                                  </DropdownMenuItem>
                                )}
                                {payment.status === 'failed' && (
                                  <DropdownMenuItem>
                                    <ArrowDownUp className="mr-2 h-4 w-4" />{' '}
                                    Retry Payment
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
          </CardContent>

          <CardFooter className="border-t py-3 flex justify-between">
            <div className="text-xs text-muted-foreground">
              Showing {sortedPayments.length} of {payments.length} transactions
            </div>
            <div className="text-sm">
              Total:{' '}
              <span className="font-semibold">
                ₱{getTotalAmount(selectedStatus)}
              </span>
            </div>
          </CardFooter>
        </Card>
      </div>

      <div className="space-y-4">
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
                        {payment.status === 'completed' && (
                          <Check className="h-4 w-4 text-green-600" />
                        )}
                        {payment.status === 'failed' && (
                          <X className="h-4 w-4 text-red-600" />
                        )}
                        {payment.status === 'refunded' && (
                          <ArrowDownUp className="h-4 w-4 text-amber-600" />
                        )}
                        {payment.status === 'pending' && (
                          <Calendar className="h-4 w-4 text-gray-600" />
                        )}
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
                          {payment.customer
                            ? payment.customer
                            : 'Walk-in Customer'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        ₱{payment.amount.toFixed(2)}
                      </div>
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

        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>Configure accepted payment types</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Removed Tabs & Settings. Show direct list with switches */}
            <div className="space-y-4">
              {/* Cash */}
              <div className="flex justify-between items-center border p-3 rounded-md">
                <div className="flex items-center gap-3">
                  <Banknote className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">Cash</p>
                    <p className="text-xs text-muted-foreground">
                      Physical currency
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {methodActive.cash ? 'Active' : 'Inactive'}
                  </span>
                  <Switch
                    checked={methodActive.cash}
                    onCheckedChange={(v) =>
                      setMethodActive((prev) => ({ ...prev, cash: v }))
                    }
                    aria-label="Toggle cash method"
                  />
                </div>
              </div>

              {/* Card */}
              <div className="flex justify-between items-center border p-3 rounded-md">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Credit/Debit Cards</p>
                    <p className="text-xs text-muted-foreground">
                      Visa, Mastercard, Amex
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {methodActive.card ? 'Active' : 'Inactive'}
                  </span>
                  <Switch
                    checked={methodActive.card}
                    onCheckedChange={(v) =>
                      setMethodActive((prev) => ({ ...prev, card: v }))
                    }
                    aria-label="Toggle card method"
                  />
                </div>
              </div>

              {/* Mobile */}
              <div className="flex justify-between items-center border p-3 rounded-md">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-medium">Mobile Payments</p>
                    <p className="text-xs text-muted-foreground">
                      Apple Pay, Google Pay
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {methodActive.mobile ? 'Active' : 'Inactive'}
                  </span>
                  <Switch
                    checked={methodActive.mobile}
                    onCheckedChange={(v) =>
                      setMethodActive((prev) => ({ ...prev, mobile: v }))
                    }
                    aria-label="Toggle mobile method"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Payments;
