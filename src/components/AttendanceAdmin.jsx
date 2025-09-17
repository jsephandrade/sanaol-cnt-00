import React, { useEffect, useMemo, useState } from 'react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { LogIn, LogOut, Edit as EditIcon, Trash2, Loader2 } from 'lucide-react';

export default function AttendanceAdmin() {
  const { user, hasAnyRole } = useAuth();
  const isManager = hasAnyRole(['admin', 'manager']);
  const {
    records,
    loading,
    setParams,
    createRecord,
    updateRecord,
    deleteRecord,
  } = useAttendance();
  const { employees } = useEmployees();
  const [filters, setFilters] = useState({
    employeeId: '_all',
    from: '',
    to: '',
    status: '_any',
  });
  const [editing, setEditing] = useState(null);

  const todayStr = () => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };
  const nowTime = () => {
    const d = new Date();
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  };

  const matchedEmployeeId = useMemo(() => {
    const email = (user?.email || '').trim().toLowerCase();
    const name = (user?.name || '').trim().toLowerCase();
    const found =
      employees.find((e) => (e.contact || '').trim().toLowerCase() === email) ||
      employees.find((e) => (e.name || '').trim().toLowerCase() === name) ||
      null;
    return found?.id || null;
  }, [employees, user?.email, user?.name]);

  const primaryEmployeeId = useMemo(() => {
    return (
      (user?.employeeId && String(user.employeeId)) ||
      (matchedEmployeeId && String(matchedEmployeeId)) ||
      null
    );
  }, [user?.employeeId, matchedEmployeeId]);

  const subjectId = useMemo(() => {
    return primaryEmployeeId || (user?.id && String(user.id)) || null;
  }, [primaryEmployeeId, user?.id]);

  // Staff: load only own records (if known). Otherwise fetch defaults
  useEffect(() => {
    if (isManager) return;
    if (primaryEmployeeId) setParams({ employeeId: primaryEmployeeId });
    else setParams({});
  }, [isManager, primaryEmployeeId, setParams]);

  const onTimeIn = async () => {
    const empId = primaryEmployeeId; // only include in payload if real employee ID is known
    const today = todayStr();
    const open = (records || []).find(
      (r) =>
        r.date === today && !r.checkOut && (!empId || r.employeeId === empId)
    );
    if (open) {
      toast.error('Already timed in for today. Use Time Out.');
      return;
    }
    try {
      const payload = {
        employeeName: user?.name || '',
        date: today,
        checkIn: nowTime(),
        status: 'present',
        notes: '',
      };
      if (empId) payload.employeeId = empId;
      await createRecord(payload);
      toast.success('Timed in');
    } catch (e) {
      toast.error(e?.message || 'Failed to time in');
    }
  };

  const onTimeOut = async () => {
    const empId = primaryEmployeeId; // if unknown, rely on server to identify open record
    const today = todayStr();
    const open = (records || []).find(
      (r) =>
        r.date === today && !r.checkOut && (!empId || r.employeeId === empId)
    );
    if (!open) {
      toast.error('No open time-in record for today');
      return;
    }
    try {
      await updateRecord(open.id, { checkOut: nowTime() });
      toast.success('Timed out');
    } catch (e) {
      toast.error(e?.message || 'Failed to time out');
    }
  };

  // Auto-apply filters (manager view only)
  useEffect(() => {
    if (!isManager) return;
    const payload = {
      employeeId: filters.employeeId === '_all' ? '' : filters.employeeId,
      from: filters.from || '',
      to: filters.to || '',
      status: filters.status === '_any' ? '' : filters.status,
    };
    setParams(payload);
  }, [filters, isManager, setParams]);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-semibold">Attendance</h2>
        </div>
        <div className="flex gap-2" />
      </div>
      <Card className="max-w-4xl">
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={onTimeIn} title="Time In">
              <LogIn className="h-3.5 w-3.5 mr-2" /> Time In
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="text-white"
              onClick={onTimeOut}
              title="Time Out"
            >
              <LogOut className="h-3.5 w-3.5 mr-2" /> Time Out
            </Button>
          </div>
          {/* Today status for the signed-in user */}
          <div className="text-xs text-muted-foreground mt-2">
            {(() => {
              const id = subjectId;
              const today = todayStr();
              const open = id
                ? (records || []).find(
                    (r) =>
                      r.employeeId === id && r.date === today && !r.checkOut
                  )
                : null;
              if (!id) return 'No linked employee profile';
              if (open && open.checkIn)
                return `Today: Checked in at ${open.checkIn}`;
              const todayRec = id
                ? (records || []).find(
                    (r) => r.employeeId === id && r.date === today
                  )
                : null;
              if (todayRec && todayRec.checkOut)
                return `Today: Checked out at ${todayRec.checkOut}`;
              return 'Today: Not checked in';
            })()}
          </div>

          {!isManager && (
            <div className="mt-4">
              <div className="text-xs font-medium mb-2">
                My Attendance (recent)
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left text-muted-foreground">
                      <th className="py-1 pr-2">Date</th>
                      <th className="py-1 pr-2">In</th>
                      <th className="py-1 pr-2">Out</th>
                      <th className="py-1">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const id = subjectId;
                      const list = (records || []).filter(
                        (r) => r.employeeId === id
                      );
                      list.sort((a, b) =>
                        String(b.date).localeCompare(String(a.date))
                      );
                      return list.slice(0, 8).map((r) => (
                        <tr key={r.id} className="border-t">
                          <td className="py-1 pr-2">{r.date}</td>
                          <td className="py-1 pr-2">{r.checkIn || '-'}</td>
                          <td className="py-1 pr-2">{r.checkOut || '-'}</td>
                          <td className="py-1 capitalize">{r.status || '-'}</td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {isManager && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Attendance Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
              <div>
                <Label>Employee</Label>
                <Select
                  value={filters.employeeId}
                  onValueChange={(v) =>
                    setFilters((f) => ({ ...f, employeeId: v }))
                  }
                >
                  <SelectTrigger className="w-full h-8 text-xs">
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
                  onValueChange={(v) =>
                    setFilters((f) => ({ ...f, status: v }))
                  }
                >
                  <SelectTrigger className="w-full h-8 text-xs">
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

            <div className="overflow-x-auto mt-4">
              <Table>
                <TableHeader>
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
                          <EditIcon className="h-3.5 w-3.5 mr-1" /> Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={async () => {
                            try {
                              await deleteRecord(r.id);
                              toast.success('Attendance deleted');
                            } catch {
                              toast.error('Failed to delete');
                            }
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {loading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-3">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading...
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {isManager && (
        <Dialog
          open={Boolean(editing)}
          onOpenChange={(v) => !v && setEditing(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editing?.id ? 'Edit Attendance' : 'Add Attendance'}
              </DialogTitle>
              <DialogDescription>Update employee attendance.</DialogDescription>
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
                  onValueChange={(v) =>
                    setEditing((x) => ({ ...x, status: v }))
                  }
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
              <Button
                onClick={async () => {
                  try {
                    if (!editing.employeeId || !editing.date) {
                      toast.error('Employee and date are required');
                      return;
                    }
                    if (!editing.id) await createRecord(editing);
                    else await updateRecord(editing.id, editing);
                    setEditing(null);
                    toast.success('Saved');
                  } catch {
                    toast.error('Failed to save');
                  }
                }}
              >
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
