import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { History } from 'lucide-react';

const InventoryRecentActivity = ({ recentActivities }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Inventory Activity</CardTitle>
        <CardDescription>Latest inventory changes and updates</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0"
            >
              <div className="bg-muted rounded-full p-2">
                <History className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex justify-between items-start">
                  <p className="font-medium text-sm">{activity.action}</p>
                  <span className="text-xs text-muted-foreground">
                    {activity.timestamp}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {activity.item} • {activity.quantity}
                </p>
                <p className="text-xs text-muted-foreground">By {activity.user}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default InventoryRecentActivity;

