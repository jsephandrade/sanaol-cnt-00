import React, { useMemo, useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { useAttendance } from '@/hooks/useAttendance';
import { useEmployees } from '@/hooks/useEmployees';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Edit as EditIcon, Trash2, Loader2, Plus } from 'lucide-react';
import FeaturePanelCard from '@/components/shared/FeaturePanelCard';

export default function AttendanceAdmin() {
  const { hasAnyRole } = useAuth();
  const isManager = hasAnyRole(['admin', 'manager']);
  const [filters, setFilters] = useState({
    employeeId: '_all',
    from: '',
    to: '',
    status: '_any',
  });
  const [editing, setEditing] = useState(null);
  const attendanceParams = useMemo(
    () => ({
      employeeId: filters.employeeId === '_all' ? '' : filters.employeeId,
      from: filters.from || '',
      to: filters.to || '',
      status: filters.status === '_any' ? '' : filters.status,
    }),
    [filters]
  );

  const [saving, setSaving] = useState(false);

  const {
    records,
    loading,
    refetch,
    createRecord,
    updateRecord,
    deleteRecord,
  } = useAttendance(attendanceParams, {
    autoFetch: isManager,
    watchInitialParams: true,
  });
  const { employees, loading: employeesLoading } = useEmployees();

  const handleAddAttendance = () => {
    if (!employees.length) {
      toast.error('No employees available');
      return;
    }
    const preferredEmployeeId =
      filters.employeeId && filters.employeeId !== '_all'
        ? filters.employeeId
        : employees[0]?.id;
    const today = new Date().toISOString().split('T')[0];
    setEditing({
      employeeId: preferredEmployeeId || '',
      date: filters.from || today,
      checkIn: '',
      checkOut: '',
      status: 'present',
      notes: '',
    });
  };

  const handleSaveAttendance = async () => {
    if (!editing) return;
    if (!editing.employeeId || !editing.date) {
      toast.error('Employee and date are required');
      return;
    }
    setSaving(true);
    try {
      const isNew = !editing.id;
      if (isNew) {
        await createRecord(editing);
      } else {
        await updateRecord(editing.id, editing);
      }
      setEditing(null);
      toast.success(isNew ? 'Attendance added' : 'Attendance updated');
      try {
        await refetch();
      } catch (err) {
        console.warn('Failed to refresh attendance after save', err);
      }
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (!isManager) {
    return null;
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <FeaturePanelCard
        badgeText="Attendance Records"
        description="Review and manage employee attendance"
        contentClassName="space-y-4"
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="grid grid-cols-1 gap-3 items-end md:grid-cols-5 flex-1">
            <div>
              <Label>Employee</Label>
              <Select
                value={filters.employeeId}
                onValueChange={(v) =>
                  setFilters((f) => ({ ...f, employeeId: v }))
                }
              >
                <SelectTrigger className="h-8 w-full text-xs">
                  <SelectValue placeholder="All employees" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">All</SelectItem>
                  {employees.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>From</Label>
              <Input
                type="date"
                className="h-8 text-xs"
                value={filters.from}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, from: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>To</Label>
              <Input
                type="date"
                className="h-8 text-xs"
                value={filters.to}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, to: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={filters.status}
                onValueChange={(v) => setFilters((f) => ({ ...f, status: v }))}
              >
                <SelectTrigger className="h-8 w-full text-xs">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_any">Any</SelectItem>
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                  <SelectItem value="late">Late</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            className="h-9 w-full md:w-auto"
            onClick={handleAddAttendance}
            disabled={employeesLoading || employees.length === 0}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Attendance
          </Button>
        </div>

        <div className="overflow-x-auto mt-4">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Check In</TableHead>
                <TableHead>Check Out</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(records || []).length === 0 && !loading && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-sm text-muted-foreground"
                  >
                    No attendance records found.
                  </TableCell>
                </TableRow>
              )}
              {(records || []).map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.date}</TableCell>
                  <TableCell>{r.employeeName || r.employeeId}</TableCell>
                  <TableCell>{r.checkIn || '-'}</TableCell>
                  <TableCell>{r.checkOut || '-'}</TableCell>
                  <TableCell className="capitalize">
                    <Badge
                      variant="outline"
                      className={
                        r.status === 'present'
                          ? 'border-green-300 text-green-700'
                          : r.status === 'late'
                            ? 'border-amber-300 text-amber-700'
                            : r.status === 'absent'
                              ? 'border-red-300 text-red-700'
                              : ''
                      }
                    >
                      {r.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[240px] truncate">
                    {r.notes || '-'}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditing({ ...r })}
                    >
                      <EditIcon className="mr-1 h-3.5 w-3.5" /> Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={async () => {
                        try {
                          await deleteRecord(r.id);
                          toast.success('Deleted');
                        } catch {
                          toast.error('Failed to delete');
                        }
                      }}
                    >
                      <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {loading && (
            <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Loading...
            </div>
          )}
        </div>
      </FeaturePanelCard>

      <Dialog
        open={Boolean(editing)}
        onOpenChange={(v) => !v && setEditing(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing?.id ? 'Edit Attendance' : 'Add Attendance'}
            </DialogTitle>
            <DialogDescription>
              {editing?.id
                ? 'Update employee attendance.'
                : 'Create a manual attendance record.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid grid-cols-4 items-center gap-3">
              <Label className="text-right">Employee</Label>
              <Select
                value={editing?.employeeId || ''}
                onValueChange={(v) =>
                  setEditing((x) => ({ ...x, employeeId: v }))
                }
              >
                <SelectTrigger className="col-span-3 h-8 text-xs">
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-3">
              <Label className="text-right">Date</Label>
              <Input
                type="date"
                className="col-span-3 h-8 text-xs"
                value={editing?.date || ''}
                onChange={(e) =>
                  setEditing((x) => ({ ...x, date: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-3">
              <Label className="text-right">Check In</Label>
              <Input
                type="time"
                className="col-span-3 h-8 text-xs"
                value={editing?.checkIn || ''}
                onChange={(e) =>
                  setEditing((x) => ({ ...x, checkIn: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-3">
              <Label className="text-right">Check Out</Label>
              <Input
                type="time"
                className="col-span-3 h-8 text-xs"
                value={editing?.checkOut || ''}
                onChange={(e) =>
                  setEditing((x) => ({ ...x, checkOut: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-3">
              <Label className="text-right">Status</Label>
              <Select
                value={editing?.status || 'present'}
                onValueChange={(v) => setEditing((x) => ({ ...x, status: v }))}
              >
                <SelectTrigger className="col-span-3 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                  <SelectItem value="late">Late</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-3">
              <Label className="text-right">Notes</Label>
              <Input
                className="col-span-3 h-8 text-xs"
                value={editing?.notes || ''}
                onChange={(e) =>
                  setEditing((x) => ({ ...x, notes: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveAttendance} disabled={saving}>
              {saving && (
                <Loader2
                  className="mr-2 h-3.5 w-3.5 animate-spin"
                  aria-hidden="true"
                />
              )}
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
