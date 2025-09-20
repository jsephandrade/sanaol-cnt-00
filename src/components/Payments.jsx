import React, { useEffect, useMemo, useState } from 'react';
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
  Download,
  Receipt,
  ArrowUpDown,
  MoreVertical,
  Check,
  X,
  ArrowDownUp,
  Banknote,
  Smartphone,
  CircleDollarSign,
} from 'lucide-react';
// Removed unused Input/Select imports (handled in child filters)
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
import PaymentsHeader from '@/components/payments/PaymentsHeader';
import PaymentsFilters from '@/components/payments/PaymentsFilters';
import { paymentsService } from '@/api/services/paymentsService';

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

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await paymentsService.list({
        timeRange: dateRange,
        status: selectedStatus === 'all' ? '' : selectedStatus,
      });
      const mapped = (list || []).map((p) => ({
        ...p,
        date: p.date || p.timestamp || new Date().toISOString(),
      }));
      setPayments(mapped);
    } catch (e) {
      setError(e?.message || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, [dateRange, selectedStatus]);

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

  const formatPaymentDate = (value) => {
    if (!value) {
      return '';
    }
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return value;
    }
    return parsed.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // total computed via totalForSelectedStatus (memoized)

  const filteredPayments = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return payments.filter((payment) => {
      const matchesSearch =
        payment.orderId.toLowerCase().includes(term) ||
        (payment.customer && payment.customer.toLowerCase().includes(term));
      const matchesStatus =
        selectedStatus === 'all' || payment.status === selectedStatus;
      const methodIsActive = methodActive[payment.method] ?? true;
      return matchesSearch && matchesStatus && methodIsActive;
    });
  }, [payments, searchTerm, selectedStatus, methodActive]);

  const sortedPayments = useMemo(() => {
    return [...filteredPayments].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [filteredPayments]);

  const totalForSelectedStatus = useMemo(() => {
    return filteredPayments
      .filter((p) => p.status !== 'refunded')
      .reduce((acc, cur) => acc + cur.amount, 0)
      .toFixed(2);
  }, [filteredPayments]);

  const handleRefund = async (paymentId) => {
    try {
      const updated = await paymentsService.refund(paymentId);
      setPayments((prev) =>
        prev.map((p) => (p.id === paymentId ? { ...p, ...updated } : p))
      );
    } catch (e) {
      // optionally show toast
    }
  };

  // Load payment method config
  useEffect(() => {
    (async () => {
      try {
        const cfg = await paymentsService.getConfig();
        setMethodActive({
          cash: Boolean(cfg.cash),
          card: Boolean(cfg.card),
          mobile: Boolean(cfg.mobile),
        });
      } catch {}
    })();
  }, []);

  const updateMethod = async (key, value) => {
    const next = { ...methodActive, [key]: value };
    setMethodActive(next);
    try {
      await paymentsService.updateConfig({
        cash: next.cash,
        card: next.card,
        mobile: next.mobile,
      });
    } catch {}
  };

  const handleDownloadInvoice = async (payment) => {
    try {
      const blob = await paymentsService.downloadInvoiceBlob(payment.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${payment.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      // optionally toast error
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="md:col-span-2 space-y-4">
        <Card>
          <PaymentsHeader />

          <CardContent className="space-y-4">
            <PaymentsFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedStatus={selectedStatus}
              setSelectedStatus={setSelectedStatus}
              dateRange={dateRange}
              setDateRange={setDateRange}
            />

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
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="h-24 text-center">
                          Loading...
                        </td>
                      </tr>
                    ) : sortedPayments.length > 0 ? (
                      sortedPayments.map((payment) => (
                        <tr
                          key={payment.id}
                          className="border-b transition-colors hover:bg-muted/50"
                        >
                          <td className="p-4 align-middle font-medium">
                            {payment.orderId
                              ? `${payment.orderId}`.slice(0, 6)
                              : ''}
                          </td>
                          <td className="p-4 align-middle whitespace-nowrap">
                            {formatPaymentDate(payment.date)}
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
                                <DropdownMenuItem
                                  onClick={() => handleDownloadInvoice(payment)}
                                >
                                  <Download className="mr-2 h-4 w-4" /> Download
                                  Invoice
                                </DropdownMenuItem>
                                {payment.status === 'completed' && (
                                  <DropdownMenuItem
                                    onClick={() => handleRefund(payment.id)}
                                  >
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
              <span className="font-semibold">₱{totalForSelectedStatus}</span>
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
                          <span className="font-medium">
                            {payment.orderId
                              ? `${payment.orderId}`.slice(0, 6)
                              : ''}
                          </span>
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
                    onCheckedChange={(v) => updateMethod('cash', v)}
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
                    onCheckedChange={(v) => updateMethod('card', v)}
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
                    onCheckedChange={(v) => updateMethod('mobile', v)}
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
