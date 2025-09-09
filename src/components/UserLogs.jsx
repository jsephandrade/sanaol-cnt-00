import React, { useState } from 'react';
import { FileText, ShieldAlert, UserCog, LogIn, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ActivityLogsCard from './user-logs/ActivityLogsCard';
import SecurityAlertsCard from './user-logs/SecurityAlertsCard';
import LogSummaryCard from './user-logs/LogSummaryCard';
import LogDetailsDialog from './user-logs/LogDetailsDialog';

const UserLogs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLogType, setSelectedLogType] = useState('all');
  const [timeRange, setTimeRange] = useState('24h');
  const [selectedLog, setSelectedLog] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  const [logs, _setLogs] = useState([
    {
      id: '1',
      action: 'User Login',
      user: 'user@example.com',
      timestamp: '2025-04-17 09:32:15',
      details: 'Successful login from IP 192.168.1.105',
      type: 'login',
    },
    {
      id: '2',
      action: 'Menu Item Added',
      user: 'sarah@example.com',
      timestamp: '2025-04-17 10:15:22',
      details: 'Added new menu item "Grilled Chicken Sandwich" to lunch menu',
      type: 'action',
    },
    {
      id: '3',
      action: 'Inventory Updated',
      user: 'miguel@example.com',
      timestamp: '2025-04-17 11:25:40',
      details: 'Updated stock levels for Rice (-5kg) and Tomatoes (-2kg)',
      type: 'action',
    },
    {
      id: '4',
      action: 'Payment Processed',
      user: 'aisha@example.com',
      timestamp: '2025-04-17 12:10:05',
      details: 'Processed card payment of $45.75 for order #1289',
      type: 'action',
    },
    {
      id: '5',
      action: 'Failed Login Attempt',
      user: 'unknown',
      timestamp: '2025-04-17 13:27:51',
      details: 'Failed login attempt for user@example.com from IP 203.45.67.89',
      type: 'security',
    },
    {
      id: '6',
      action: 'System Backup',
      user: 'system',
      timestamp: '2025-04-17 14:00:00',
      details: 'Automated system backup completed successfully',
      type: 'system',
    },
    {
      id: '7',
      action: 'User Role Changed',
      user: 'user@example.com',
      timestamp: '2025-04-17 14:55:12',
      details: 'Changed role for david@example.com from Staff to Cashier',
      type: 'security',
    },
  ]);

  const [securityAlerts, setSecurityAlerts] = useState([
    {
      id: '1',
      type: 'critical',
      title: 'Failed Login Attempts',
      description:
        'Multiple failed login attempts detected for admin account from unknown IP address',
      dismissed: false,
    },
    {
      id: '2',
      type: 'warning',
      title: 'Password Expiring',
      description: '2 user passwords will expire in the next 7 days',
      dismissed: false,
    },
  ]);

  const getActionIcon = (type) => {
    switch (type) {
      case 'login':
        return <LogIn className="h-4 w-4" />;
      case 'security':
        return <ShieldAlert className="h-4 w-4" />;
      case 'system':
        return <Settings className="h-4 w-4" />;
      case 'action':
        return <UserCog className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getActionColor = (type) => {
    switch (type) {
      case 'login':
        return 'bg-blue-100 text-blue-800';
      case 'security':
        return 'bg-red-100 text-red-800';
      case 'system':
        return 'bg-gray-100 text-gray-800';
      case 'action':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleBlockIP = (alertId) => {
    toast({
      title: 'IP Address Blocked',
      description: 'The suspicious IP address has been blocked successfully.',
    });
    // Remove the alert after blocking IP
    setSecurityAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
  };

  const handleDismissAlert = (alertId) => {
    setSecurityAlerts((prev) =>
      prev
        .map((alert) =>
          alert.id === alertId ? { ...alert, dismissed: true } : alert
        )
        .filter((alert) => !alert.dismissed)
    );
    toast({
      title: 'Alert Dismissed',
      description: 'Security alert has been dismissed.',
    });
  };

  const handleRowClick = (log) => {
    setSelectedLog(log);
    setIsModalOpen(true);
  };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="md:col-span-2 space-y-4">
        <ActivityLogsCard
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedLogType={selectedLogType}
          setSelectedLogType={setSelectedLogType}
          timeRange={timeRange}
          setTimeRange={setTimeRange}
          logs={logs}
          onRowClick={handleRowClick}
          getActionIcon={getActionIcon}
          getActionColor={getActionColor}
        />
      </div>

      <div className="space-y-4">
        <SecurityAlertsCard
          securityAlerts={securityAlerts}
          onBlockIP={handleBlockIP}
          onDismiss={handleDismissAlert}
        />

        <LogSummaryCard />
      </div>

      <LogDetailsDialog
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        selectedLog={selectedLog}
        getActionIcon={getActionIcon}
        getActionColor={getActionColor}
      />
    </div>
  );
};

export default UserLogs;
