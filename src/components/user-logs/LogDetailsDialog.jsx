import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Clock } from 'lucide-react';

const LogDetailsDialog = ({ open, onOpenChange, selectedLog, getActionIcon, getActionColor }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Log Details</DialogTitle>
          <DialogDescription>Complete information about this log entry</DialogDescription>
        </DialogHeader>
        {selectedLog && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Log ID</label>
                <p className="text-sm font-mono bg-muted px-2 py-1 rounded">{selectedLog.id}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Action Type</label>
                <div className="flex items-center gap-2">
                  <div className={`rounded-full p-1 ${getActionColor(selectedLog.type)}`}>
                    {getActionIcon(selectedLog.type)}
                  </div>
                  <span className="text-sm capitalize">{selectedLog.type}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Action</label>
              <p className="text-lg font-medium">{selectedLog.action}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">User</label>
                <p className="text-sm">{selectedLog.user}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Timestamp</label>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <p className="text-sm">{selectedLog.timestamp}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Details</label>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm">{selectedLog.details}</p>
              </div>
            </div>

            <div className="space-y-4 border-t pt-4">
              <h4 className="text-sm font-medium">Technical Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-muted-foreground">Session ID:</span>
                  <p className="font-mono bg-muted px-2 py-1 rounded">sess_{Math.random().toString(36).substr(2, 9)}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground">IP Address:</span>
                  <p className="font-mono bg-muted px-2 py-1 rounded">
                    {selectedLog.type === 'security' && selectedLog.details.includes('203.45.67.89')
                      ? '203.45.67.89'
                      : '192.168.1.105'}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground">User Agent:</span>
                  <p className="font-mono bg-muted px-2 py-1 rounded text-xs truncate">Mozilla/5.0 (Windows NT 10.0; Win64; x64)</p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground">Request ID:</span>
                  <p className="font-mono bg-muted px-2 py-1 rounded">req_{Math.random().toString(36).substr(2, 9)}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LogDetailsDialog;

