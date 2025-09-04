import React from 'react';
import { Banknote, CreditCard, Smartphone } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';

export const PaymentMethods = ({ methodActive, setMethodActive }) => {
  const methods = [
    {
      key: 'cash',
      icon: <Banknote className="h-5 w-5 text-green-600" />,
      name: 'Cash',
      description: 'Physical currency',
    },
    {
      key: 'card',
      icon: <CreditCard className="h-5 w-5 text-blue-600" />,
      name: 'Card',
      description: 'Credit/Debit cards',
    },
    {
      key: 'mobile',
      icon: <Smartphone className="h-5 w-5 text-purple-600" />,
      name: 'Mobile',
      description: 'Digital payments',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Methods</CardTitle>
        <CardDescription>Configure accepted payment types</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {methods.map((method) => (
            <div
              key={method.key}
              className="flex justify-between items-center border p-3 rounded-md"
            >
              <div className="flex items-center gap-3">
                {method.icon}
                <div>
                  <p className="font-medium">{method.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {method.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {methodActive[method.key] ? 'Active' : 'Inactive'}
                </span>
                <Switch
                  checked={methodActive[method.key]}
                  onCheckedChange={(v) =>
                    setMethodActive((prev) => ({ ...prev, [method.key]: v }))
                  }
                  aria-label={`Toggle ${method.name} method`}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};