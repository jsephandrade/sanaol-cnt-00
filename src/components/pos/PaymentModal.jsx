import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Delete } from 'lucide-react';

const PaymentModal = ({
  isOpen,
  onClose,
  currentOrder,
  discount,
  onProcessPayment,
  calculateSubtotal,
  calculateDiscountAmount,
  calculateTotal,
}) => {
  const [paymentAmount, setPaymentAmount] = useState('');
  const [change, setChange] = useState(0);

  const totalAmount = calculateTotal();

  useEffect(() => {
    const payment = parseFloat(paymentAmount) || 0;
    const calculatedChange = payment - totalAmount;
    setChange(calculatedChange >= 0 ? calculatedChange : 0);
  }, [paymentAmount, totalAmount]);

  const handlePaymentAmountChange = (e) => {
    const value = e.target.value;
    // Only allow numbers and decimal point
    if (/^\d*\.?\d*$/.test(value)) {
      setPaymentAmount(value);
    }
  };

  const handleNumberClick = (number) => {
    if (number === '.' && paymentAmount.includes('.')) return;
    setPaymentAmount((prev) => prev + number);
  };

  const handleClear = () => {
    setPaymentAmount('');
  };

  const handleBackspace = () => {
    setPaymentAmount((prev) => prev.slice(0, -1));
  };

  const isPaymentValid = () => {
    const payment = parseFloat(paymentAmount) || 0;
    return payment >= totalAmount;
  };

  const handleProcessPayment = () => {
    if (isPaymentValid()) {
      onProcessPayment();
      setPaymentAmount('');
      setChange(0);
    }
  };

  if (!isOpen) return null;

  const numberButtons = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['C', '0', '.'],
  ];

  return (
    <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>Complete Payment</CardTitle>
            <CardDescription>Enter payment amount</CardDescription>
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
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-3xl font-bold">₱{totalAmount.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">Total amount due</p>
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="payment-amount"
                className="block text-sm font-medium mb-2"
              >
                Payment Amount
              </label>
              <Input
                id="payment-amount"
                type="text"
                placeholder="0.00"
                value={paymentAmount}
                onChange={handlePaymentAmountChange}
                className="text-lg text-center"
                readOnly
              />
            </div>

            {/* Number Keyboard */}
            <div className="grid grid-cols-3 gap-2">
              {numberButtons.map((row, rowIndex) =>
                row.map((button) => (
                  <Button
                    key={`${rowIndex}-${button}`}
                    variant="outline"
                    className="h-12 text-lg font-semibold"
                    onClick={() => {
                      if (button === 'C') {
                        handleClear();
                      } else {
                        handleNumberClick(button);
                      }
                    }}
                  >
                    {button}
                  </Button>
                ))
              )}
              <Button
                variant="outline"
                className="h-12 col-span-3"
                onClick={handleBackspace}
              >
                <Delete className="h-4 w-4" />
              </Button>
            </div>

            <div className="text-center">
              <p className="text-2xl font-semibold text-green-600">
                ₱{change.toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground">Change</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex gap-3">
          <Button
            className="flex-1"
            onClick={handleProcessPayment}
            disabled={!isPaymentValid()}
          >
            Process Payment
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PaymentModal;
