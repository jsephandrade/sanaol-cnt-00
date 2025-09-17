import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Bell, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { createRealtime } from '@/lib/realtime';
import { notificationsService } from '@/api/services/notificationsService';
import { subscribePush, unsubscribePush } from '@/lib/push';
const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [settings, setSettings] = useState({
    emailEnabled: true,
    pushEnabled: false,
    lowStock: true,
    order: true,
    payment: true,
  });

  // Helpers
  const fmtRelative = (iso) => {
    try {
      const d = new Date(iso);
      const now = new Date();
      const diff = Math.max(0, (now - d) / 1000);
      if (diff < 60) return `${Math.floor(diff)}s ago`;
      if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
      return d.toLocaleDateString();
    } catch {
      return iso || '';
    }
  };

  const refreshList = async () => {
    try {
      const res = await notificationsService.getRecent(100);
      const list = (res?.data || []).map((n) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        createdAt: n.createdAt,
        time: fmtRelative(n.createdAt),
        read: Boolean(n.read || n.isRead),
        type:
          n.type === 'low_stock'
            ? 'warning'
            : n.type === 'new_order'
              ? 'info'
              : n.type === 'payment'
                ? 'success'
                : n.type || 'info',
      }));
      setNotifications(list);
    } catch {
      // leave prior state
    }
  };

  const loadSettings = async () => {
    try {
      const data = await notificationsService.getSettings();
      setSettings({
        emailEnabled: Boolean(data.emailEnabled),
        pushEnabled: Boolean(data.pushEnabled),
        lowStock: Boolean(data.lowStock),
        order: Boolean(data.order),
        payment: Boolean(data.payment),
      });
    } catch {}
  };

  useEffect(() => {
    refreshList();
    loadSettings();
  }, []);

  // Realtime notifications with fallback
  const pollRef = useRef(null);
  useEffect(() => {
    const enableRealtime = Boolean(import.meta?.env?.VITE_WS_URL);
    const startPolling = () => {
      if (pollRef.current) return;
      // Placeholder: in real API, fetch latest notifications here
      pollRef.current = setInterval(() => {
        // no-op polling fallback
      }, 15000);
    };
    const stopPolling = () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };

    let rt;
    if (enableRealtime) {
      rt = createRealtime({
        path: '/notifications',
        onMessage: (msg) => {
          if (msg?.type === 'notification' && msg?.data) {
            const n = msg.data;
            const norm = {
              id: n.id || `${Date.now()}`,
              title: n.title || 'Notification',
              message: n.message || '',
              createdAt: n.createdAt || new Date().toISOString(),
              time: fmtRelative(n.createdAt || new Date().toISOString()),
              read: false,
              type:
                n.type === 'low_stock'
                  ? 'warning'
                  : n.type === 'new_order'
                    ? 'info'
                    : n.type === 'payment'
                      ? 'success'
                      : n.type || 'info',
            };
            setNotifications((prev) => [norm, ...prev].slice(0, 100));
          }
        },
        onStatusChange: (status) => {
          if (status === 'open') stopPolling();
          if (
            status === 'reconnecting' ||
            status === 'error' ||
            status === 'closed'
          )
            startPolling();
        },
      });
      startPolling();
    } else {
      startPolling();
    }

    return () => {
      stopPolling();
      rt?.close?.();
    };
  }, []);
  const markAllAsRead = async () => {
    try {
      await notificationsService.markAllRead?.();
    } catch {}
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };
  const markAsRead = async (id) => {
    try {
      await notificationsService.markRead?.(id);
    } catch {}
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };
  const deleteNotification = async (id) => {
    try {
      await notificationsService.delete?.(id);
    } catch {}
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };
  const handleSettingChange = async (key) => {
    // Special handling for push: request permission before enabling
    if (key === 'pushEnabled') {
      const next = !settings.pushEnabled;
      if (
        next &&
        typeof Notification !== 'undefined' &&
        Notification?.permission !== 'granted'
      ) {
        try {
          const perm = await Notification.requestPermission();
          if (perm !== 'granted') {
            // Do not enable if permission denied
            return;
          }
        } catch {}
      }
      // Register or unregister push subscription
      try {
        if (next) {
          await subscribePush();
        } else {
          await unsubscribePush();
        }
      } catch {}
    }
    const nextState = { ...settings, [key]: !settings[key] };
    setSettings(nextState);
    try {
      await notificationsService.updateSettings(nextState);
    } catch {}
  };
  const unreadCount = notifications.filter((n) => !n.read).length;
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="md:col-span-2 space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-2xl">Notification Center</CardTitle>
              <CardDescription>System alerts and messages</CardDescription>
            </div>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {unreadCount} unread
              </Badge>
            )}
          </CardHeader>
          <CardContent>
            {notifications.length > 0 ? (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg flex items-start justify-between ${notification.read ? 'bg-background' : 'bg-muted/40'}`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="mt-1">
                        {notification.type === 'warning' && (
                          <Bell className="h-5 w-5 text-orange-500" />
                        )}
                        {notification.type === 'info' && (
                          <Bell className="h-5 w-5 text-blue-500" />
                        )}
                        {notification.type === 'success' && (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                        {notification.type === 'error' && (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                      <div>
                        <h4
                          className={`font-medium ${notification.read ? '' : 'font-semibold'}`}
                        >
                          {notification.title}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {notification.message}
                        </p>
                        <span className="text-xs text-muted-foreground mt-1 block">
                          {notification.time}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                        >
                          Mark as read
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNotification(notification.id)}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Bell className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">
                  No notifications to display
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              Mark all as read
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              onClick={refreshList}
            >
              <RefreshCw className="h-4 w-4 mr-1" /> Refresh
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>Configure alert preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive alerts via email
                </p>
              </div>
              <Switch
                checked={settings.emailEnabled}
                onCheckedChange={() => handleSettingChange('emailEnabled')}
              />
            </div>
            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Browser notifications
                </p>
              </div>
              <Switch
                checked={settings.pushEnabled}
                onCheckedChange={() => handleSettingChange('pushEnabled')}
              />
            </div>
            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Low Stock Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  When inventory is low
                </p>
              </div>
              <Switch
                checked={settings.lowStock}
                onCheckedChange={() => handleSettingChange('lowStock')}
              />
            </div>
            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Order Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  New and updated orders
                </p>
              </div>
              <Switch
                checked={settings.order}
                onCheckedChange={() => handleSettingChange('order')}
              />
            </div>
            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Payment Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Payment confirmations
                </p>
              </div>
              <Switch
                checked={settings.payment}
                onCheckedChange={() => handleSettingChange('payment')}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
export default Notifications;
