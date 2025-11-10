import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, Pencil, Archive, RotateCcw } from 'lucide-react';

const DEFAULT_FORM = {
  name: '',
  position: '',
  hourlyRate: '0',
  contact: '',
  status: 'active',
};

const statusBadgeMap = {
  active: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20',
  inactive: 'bg-muted text-muted-foreground border border-border/60',
};

const EmployeeDirectoryPanel = ({
  employees = [],
  loading = false,
  onCreateEmployee,
  onUpdateEmployee,
  onToggleEmployeeStatus,
  canManage = false,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formState, setFormState] = useState({ ...DEFAULT_FORM });

  const sortedEmployees = useMemo(() => {
    return [...employees].sort((a, b) => {
      const statusPriority = {
        active: 0,
        pending: 1,
        inactive: 2,
      };
      const statusDiff =
        (statusPriority[a?.status] ?? 3) - (statusPriority[b?.status] ?? 3);
      if (statusDiff !== 0) return statusDiff;
      return (a?.name || '').localeCompare(b?.name || '');
    });
  }, [employees]);

  const handleDialogOpenChange = (open) => {
    if (!open) {
      setEditingId(null);
      setFormState({ ...DEFAULT_FORM });
    }
    setDialogOpen(open);
  };

  const handleStartCreate = () => {
    if (!canManage) return;
    setEditingId(null);
    setFormState({ ...DEFAULT_FORM });
    setDialogOpen(true);
  };

  const handleStartEdit = (employee) => {
    if (!canManage || !employee) return;
    setEditingId(employee.id);
    setFormState({
      name: employee.name || '',
      position: employee.position || '',
      hourlyRate:
        employee.hourlyRate === null || employee.hourlyRate === undefined
          ? '0'
          : String(employee.hourlyRate),
      contact: employee.contact || '',
      status: employee.status || 'active',
    });
    setDialogOpen(true);
  };

  const handleFormChange = (field, value) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!canManage) return;
    if (
      typeof onCreateEmployee !== 'function' ||
      typeof onUpdateEmployee !== 'function'
    ) {
      return;
    }
    setSubmitting(true);
    const payload = { ...formState };
    const success = editingId
      ? await onUpdateEmployee(editingId, payload)
      : await onCreateEmployee(payload);
    setSubmitting(false);
    if (success) {
      handleDialogOpenChange(false);
    }
  };

  const handleToggleStatus = async (employee) => {
    if (!canManage || typeof onToggleEmployeeStatus !== 'function') return;
    const nextStatus = employee?.status === 'inactive' ? 'active' : 'inactive';
    await onToggleEmployeeStatus(employee, nextStatus);
  };

  const renderRows = () => {
    if (loading) {
      return Array.from({ length: 4 }).map((_, index) => (
        <TableRow key={`employee-skeleton-${index}`}>
          <TableCell colSpan={5}>
            <Skeleton className="h-10 w-full rounded-md" />
          </TableCell>
        </TableRow>
      ));
    }

    if (sortedEmployees.length === 0) {
      return (
        <TableRow>
          <TableCell
            colSpan={5}
            className="py-10 text-center text-sm text-muted-foreground"
          >
            No employees found. {canManage ? 'Add your first teammate.' : ''}
          </TableCell>
        </TableRow>
      );
    }

    return sortedEmployees.map((employee) => (
      <TableRow key={employee.id}>
        <TableCell className="font-semibold">{employee.name}</TableCell>
        <TableCell className="text-muted-foreground">
          {employee.position || '—'}
        </TableCell>
        <TableCell>₱{Number(employee.hourlyRate || 0).toFixed(2)}</TableCell>
        <TableCell>
          <Badge
            className={
              statusBadgeMap[employee.status] ||
              'bg-muted text-muted-foreground'
            }
          >
            {employee.status || 'unknown'}
          </Badge>
        </TableCell>
        <TableCell className="flex items-center gap-2">
          {canManage ? (
            <>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-muted-foreground"
                onClick={() => handleStartEdit(employee)}
              >
                <Pencil className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">Edit employee</span>
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-muted-foreground"
                onClick={() => handleToggleStatus(employee)}
              >
                {employee.status === 'inactive' ? (
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Archive className="h-4 w-4" aria-hidden="true" />
                )}
                <span className="sr-only">
                  {employee.status === 'inactive'
                    ? 'Restore employee'
                    : 'Archive employee'}
                </span>
              </Button>
            </>
          ) : (
            <span className="text-xs text-muted-foreground">Read only</span>
          )}
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <div className="space-y-4 rounded-3xl border border-border/70 bg-card/70 p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Employee Directory</h2>
          <p className="text-sm text-muted-foreground">
            Keep your roster up to date before assigning shifts.
          </p>
        </div>
        {canManage ? (
          <Button className="gap-2" size="sm" onClick={handleStartCreate}>
            <PlusCircle className="h-4 w-4" aria-hidden="true" />
            Add Employee
          </Button>
        ) : null}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border/60">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Hourly Rate</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[140px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>{renderRows()}</TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Update Employee' : 'Add Employee'}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? 'Edit the selected employee details.'
                : 'Create a new employee entry for scheduling.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="employee-name">Full name</Label>
              <Input
                id="employee-name"
                value={formState.name}
                onChange={(event) =>
                  handleFormChange('name', event.target.value)
                }
                placeholder="e.g. Jane Dela Cruz"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="employee-position">Role / Position</Label>
              <Input
                id="employee-position"
                value={formState.position}
                onChange={(event) =>
                  handleFormChange('position', event.target.value)
                }
                placeholder="e.g. Barista"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="employee-hourly">Hourly rate (₱)</Label>
                <Input
                  id="employee-hourly"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formState.hourlyRate}
                  onChange={(event) =>
                    handleFormChange('hourlyRate', event.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employee-status">Status</Label>
                <Select
                  value={formState.status}
                  onValueChange={(value) => handleFormChange('status', value)}
                >
                  <SelectTrigger id="employee-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="employee-contact">Contact details</Label>
              <Input
                id="employee-contact"
                value={formState.contact}
                onChange={(event) =>
                  handleFormChange('contact', event.target.value)
                }
                placeholder="Email or phone"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleDialogOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {editingId ? 'Save changes' : 'Add employee'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmployeeDirectoryPanel;
