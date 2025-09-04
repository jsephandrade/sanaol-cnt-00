import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Download, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getActionIcon, getActionColor } from './utils';

const ActivityLogsCard = ({
  searchTerm,
  onSearchChange,
  selectedLogType,
  onLogTypeChange,
  timeRange,
  onTimeRangeChange,
  sortedLogs,
  filteredCount,
  totalCount,
  onRowClick,
  onExport,
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Activity Logs</CardTitle>
          <CardDescription>Track system and user activities</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            onClick={onExport}
          >
            <Download className="h-4 w-4 mr-1" /> Export
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col space-y-2 md:flex-row md:space-x-2 md:space-y-0">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search logs..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

          <Select value={selectedLogType} onValueChange={onLogTypeChange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Log Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="login">Login</SelectItem>
              <SelectItem value="action">User Actions</SelectItem>
              <SelectItem value="system">System</SelectItem>
              <SelectItem value="security">Security</SelectItem>
            </SelectContent>
          </Select>

          <Select value={timeRange} onValueChange={onTimeRangeChange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border">
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="h-10 px-4 text-left font-medium">Action</th>
                  <th className="h-10 px-4 text-left font-medium">User</th>
                  <th className="h-10 px-4 text-left font-medium">Timestamp</th>
                  <th className="h-10 px-4 text-left font-medium hidden md:table-cell">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedLogs.length > 0 ? (
                  sortedLogs.map((log) => (
                    <tr
                      key={log.id}
                      className="border-b transition-colors hover:bg-muted/50 cursor-pointer"
                      onClick={() => onRowClick(log)}
                    >
                      <td className="p-4 align-middle">
                        <div className="flex items-center gap-2">
                          <div className={`rounded-full p-1 ${getActionColor(log.type)}`}>
                            {getActionIcon(log.type)}
                          </div>
                          <span>{log.action}</span>
                        </div>
                      </td>
                      <td className="p-4 align-middle">{log.user}</td>
                      <td className="p-4 align-middle whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {log.timestamp}
                        </div>
                      </td>
                      <td className="p-4 align-middle hidden md:table-cell">
                        <span className="line-clamp-1">{log.details}</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="h-24 text-center">
                      No logs found matching your criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t py-3">
        <div className="text-xs text-muted-foreground">
          Showing {filteredCount} of {totalCount} logs
        </div>
      </CardFooter>
    </Card>
  );
};

export default ActivityLogsCard;

