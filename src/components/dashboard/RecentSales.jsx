import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';

const RecentSales = ({ sales }) => {
  return (
    <Card>
      <CardHeader className="py-2">
        <CardTitle className="text-sm">Recent Sales</CardTitle>
        <CardDescription className="text-xs">
          Latest orders processed in the canteen
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="space-y-3">
          {sales.map(sale => (
            <div
              key={sale.id}
              className="flex items-center justify-between"
            >
              <div>
                <p className="font-medium text-sm">Order #{sale.id}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(sale.date).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium text-sm">
                  ₱{sale.total.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {sale.paymentMethod}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentSales;