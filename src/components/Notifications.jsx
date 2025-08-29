import React, { useState } from 'react';
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
const Notifications = () => {
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      title: 'Low Inventory Alert',
      message: 'Rice supply is below threshold (2kg remaining)',
      time: '10 mins ago',
      read: false,
      type: 'warning',
    },
    {
      id: '2',
      title: 'New Order Received',
      message: 'Catering order #2843 confirmed for tomorrow',
      time: '25 mins ago',
      read: false,
      type: 'info',
    },
    {
      id: '3',
      title: 'Payment Processed',
      message: 'Daily sales batch processed successfully',
      time: '1 hour ago',
      read: true,
      type: 'success',
    },
    {
      id: '4',
      title: 'Employee Schedule Updated',
      message: 'Chef Alex requested time off next week',
      time: '3 hours ago',
      read: true,
      type: 'info',
    },
  ]);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    lowStockAlerts: true,
    orderAlerts: true,
    paymentAlerts: true,
  });
  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
    );
  };
  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };
  const deleteNotification = (id) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  };
  const handleSettingChange = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
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
                checked={settings.emailNotifications}
                onCheckedChange={() =>
                  handleSettingChange('emailNotifications')
                }
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
                checked={settings.pushNotifications}
                onCheckedChange={() => handleSettingChange('pushNotifications')}
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
                checked={settings.lowStockAlerts}
                onCheckedChange={() => handleSettingChange('lowStockAlerts')}
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
                checked={settings.orderAlerts}
                onCheckedChange={() => handleSettingChange('orderAlerts')}
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
                checked={settings.paymentAlerts}
                onCheckedChange={() => handleSettingChange('paymentAlerts')}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
export default Notifications;
