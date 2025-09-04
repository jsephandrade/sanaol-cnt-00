import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import ActivityLogsCard from '@/components/user-logs/ActivityLogsCard';
import SecurityAlertsCard from '@/components/user-logs/SecurityAlertsCard';
import LogSummaryCard from '@/components/user-logs/LogSummaryCard';
import LogDetailsModal from '@/components/user-logs/LogDetailsModal';

const UserLogs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLogType, setSelectedLogType] = useState('all');
  const [timeRange, setTimeRange] = useState('24h');
  const [selectedLog, setSelectedLog] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  const [logs, setLogs] = useState([
    {
      id: '1',
      action: 'User Login',
      user: 'admin@canteen.com',
      timestamp: '2025-04-17 09:32:15',
      details: 'Successful login from IP 192.168.1.105',
      type: 'login',
    },
    {
      id: '2',
      action: 'Menu Item Added',
      user: 'sarah@canteen.com',
      timestamp: '2025-04-17 10:15:22',
      details: 'Added new menu item "Grilled Chicken Sandwich" to lunch menu',
      type: 'action',
    },
    {
      id: '3',
      action: 'Inventory Updated',
      user: 'miguel@canteen.com',
      timestamp: '2025-04-17 11:25:40',
      details: 'Updated stock levels for Rice (-5kg) and Tomatoes (-2kg)',
      type: 'action',
    },
    {
      id: '4',
      action: 'Payment Processed',
      user: 'aisha@canteen.com',
      timestamp: '2025-04-17 12:10:05',
      details: 'Processed card payment of $45.75 for order #1289',
      type: 'action',
    },
    {
      id: '5',
      action: 'Failed Login Attempt',
      user: 'unknown',
      timestamp: '2025-04-17 13:27:51',
      details:
        'Failed login attempt for admin@canteen.com from IP 203.45.67.89',
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
      user: 'admin@canteen.com',
      timestamp: '2025-04-17 14:55:12',
      details: 'Changed role for david@canteen.com from Staff to Cashier',
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

  const handleBlockIP = (alertId) => {
    toast({
      title: 'IP Address Blocked',
      description: 'The suspicious IP address has been blocked successfully.',
    });
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

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = selectedLogType === 'all' || log.type === selectedLogType;

    return matchesSearch && matchesType;
  });

  const sortedLogs = [...filteredLogs].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="md:col-span-2 space-y-4">
        <ActivityLogsCard
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedLogType={selectedLogType}
          onLogTypeChange={setSelectedLogType}
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
          sortedLogs={sortedLogs}
          filteredCount={filteredLogs.length}
          totalCount={logs.length}
          onRowClick={handleRowClick}
          onExport={() => {}}
        />
      </div>

      <div className="space-y-4">
        <SecurityAlertsCard
          alerts={securityAlerts}
          onBlockIP={handleBlockIP}
          onDismissAlert={handleDismissAlert}
        />
        <LogSummaryCard />
      </div>

      <LogDetailsModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        selectedLog={selectedLog}
      />
    </div>
  );
};

export default UserLogs;

