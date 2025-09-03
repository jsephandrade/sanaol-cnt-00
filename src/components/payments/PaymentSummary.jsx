import React from 'react';

/**
 * PaymentSummary
 *
 * Displays the total number of transactions visible in the table and
 * the aggregate monetary value of those transactions. This
 * component is intentionally small and stateless – it simply
 * presents data passed in via props.
 *
 * Props:
 *  - totalVisible: number of transactions currently shown
 *  - totalCount: total number of transactions in memory
 *  - totalAmount: string representing the sum (already formatted)
 */
const PaymentSummary = ({ totalVisible, totalCount, totalAmount }) => (
  <div className="border-t py-3 flex justify-between">
    <div className="text-xs text-muted-foreground">
      Showing {totalVisible} of {totalCount} transactions
    </div>
    <div className="text-sm">
      Total:{' '}
      <span className="font-semibold">₱{totalAmount}</span>
    </div>
  </div>
);

export default PaymentSummary;