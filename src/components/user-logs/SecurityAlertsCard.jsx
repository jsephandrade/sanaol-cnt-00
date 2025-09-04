import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

const SecurityAlertsCard = ({ alerts, onBlockIP, onDismissAlert }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Security Alerts</CardTitle>
        <CardDescription>Important security notifications</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`rounded-lg border p-3 flex gap-3 ${
              alert.type === 'critical' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'
            }`}
          >
            <AlertTriangle
              className={`h-5 w-5 shrink-0 mt-0.5 ${
                alert.type === 'critical' ? 'text-red-600' : 'text-amber-600'
              }`}
            />
            <div className="flex-1">
              <h4 className={`font-medium ${alert.type === 'critical' ? 'text-red-900' : 'text-amber-900'}`}>
                {alert.title}
              </h4>
              <p className={`text-sm ${alert.type === 'critical' ? 'text-red-700' : 'text-amber-700'}`}>
                {alert.description}
              </p>
              <div className="mt-2 flex gap-2">
                {alert.type === 'critical' && (
                  <Button size="sm" variant="destructive" onClick={() => onBlockIP(alert.id)}>
                    Block IP
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={() => onDismissAlert(alert.id)}>
                  Dismiss
                </Button>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default SecurityAlertsCard;

