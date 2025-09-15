import React, { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { History, Loader2 } from 'lucide-react';

const formatTimestamp = (ts) => {
  if (!ts) return '';
  try {
    const d = new Date(ts);
    // Friendly, locale-aware date and time
    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return String(ts);
  }
};

const normalize = (list = []) =>
  (list || []).map((a) => ({
    id: a.id,
    action: a.action || 'Stock Update',
    item: a.item || '',
    quantity: a.quantity ?? '',
    timestamp: a.timestamp || '',
    user: a.user || 'System',
  }));

const InventoryRecentActivity = ({
  recentActivities,
  loading = false,
  onRefresh,
}) => {
  const items = useMemo(
    () => normalize(recentActivities || []),
    [recentActivities]
  );
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Inventory Activity</CardTitle>
            <CardDescription>
              Latest inventory changes and updates
            </CardDescription>
          </div>
          {onRefresh ? (
            <Button
              size="sm"
              variant="outline"
              onClick={onRefresh}
              disabled={!!loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" /> Refreshing
                </>
              ) : (
                'Refresh'
              )}
            </Button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {(!items || items.length === 0) && (
            <p className="text-sm text-muted-foreground">
              No recent activity yet.
            </p>
          )}
          {items &&
            items.map((activity) => (
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
                      {formatTimestamp(activity.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {activity.item}
                    </span>
                    {activity.quantity ? (
                      <span> — {activity.quantity}</span>
                    ) : null}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    By {activity.user || 'System'}
                  </p>
                </div>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default InventoryRecentActivity;
