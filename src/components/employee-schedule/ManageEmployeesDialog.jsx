import React, { useEffect, useMemo, useState } from 'react';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Users } from 'lucide-react';

const EMPTY_EMPLOYEE_STATE = {
  id: '',
  name: '',
  position: '',
  hourlyRate: '',
  contact: '',
  status: 'active',
  userId: '',
  userEmail: '',
  userName: '',
  userRole: '',
};

const mapEmployeeToDialogState = (employee) => {
  if (!employee) return { ...EMPTY_EMPLOYEE_STATE };
  return {
    ...EMPTY_EMPLOYEE_STATE,
    id: employee.id || '',
    name: employee.name || '',
    position: employee.position || '',
    hourlyRate:
      employee.hourlyRate === null || employee.hourlyRate === undefined
        ? ''
        : String(employee.hourlyRate),
    contact: employee.contact || '',
    status: employee.status || 'active',
    userId: employee.userId ? String(employee.userId) : '',
    userEmail: employee.userEmail || '',
    userName: employee.userName || '',
    userRole: (employee.userRole || '').toLowerCase(),
  };
};

const ManageEmployeesDialog = ({
  open,
  onOpenChange,
  employeeList = [],
  userList = [],
  managedEmployee,
  setManagedEmployee = () => {},
  onUpdateEmployee,
  onAddEmployee,
  showTrigger = true,
}) => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const canAddEmployees = typeof onAddEmployee === 'function';

  const eligibleUsers = useMemo(() => {
    if (!Array.isArray(userList)) return [];
    return userList.filter((user) => {
      const role = (user.role || '').toLowerCase();
      return role === 'manager' || role === 'staff';
    });
  }, [userList]);

  const hasEmployees = employeeList.length > 0;

  const normalizedEmployee = useMemo(() => {
    const base = {
      ...EMPTY_EMPLOYEE_STATE,
      ...(managedEmployee || {}),
    };
    return {
      ...base,
      hourlyRate:
        base.hourlyRate === null || base.hourlyRate === undefined
          ? ''
          : String(base.hourlyRate),
      userId: base.userId ? String(base.userId) : '',
      userEmail: base.userEmail || '',
      userName: base.userName || '',
      userRole: (base.userRole || '').toLowerCase(),
    };
  }, [managedEmployee]);

  useEffect(() => {
    if (!open) {
      setSelectedEmployeeId('');
      setIsCreating(false);
      return;
    }

    if (!hasEmployees) {
      setIsCreating(true);
      setManagedEmployee({ ...EMPTY_EMPLOYEE_STATE });
      return;
    }

    if (isCreating) {
      setManagedEmployee({ ...EMPTY_EMPLOYEE_STATE });
      return;
    }

    if (selectedEmployeeId) return;

    if (normalizedEmployee.id) {
      setSelectedEmployeeId(String(normalizedEmployee.id));
      return;
    }

    const firstEmployee = employeeList[0];
    if (firstEmployee) {
      setSelectedEmployeeId(String(firstEmployee.id));
      setManagedEmployee(mapEmployeeToDialogState(firstEmployee));
    }
  }, [
    open,
    employeeList,
    normalizedEmployee.id,
    selectedEmployeeId,
    setManagedEmployee,
    hasEmployees,
    isCreating,
  ]);

  const handleSelectEmployee = (value) => {
    setIsCreating(false);
    setSelectedEmployeeId(value);
    const employee = employeeList.find(
      (item) => String(item.id) === String(value)
    );
    setManagedEmployee(mapEmployeeToDialogState(employee));
  };

  const handleFieldChange = (field, value) => {
    setManagedEmployee((prev) => {
      const base = {
        ...EMPTY_EMPLOYEE_STATE,
        ...(typeof prev === 'object' && prev !== null ? prev : {}),
      };

      if (field === 'hourlyRate') {
        return { ...base, hourlyRate: value };
      }

      return { ...base, [field]: value };
    });
  };

  const handleSelectUser = (value) => {
    if (value === '__none__') {
      setManagedEmployee((prev) => ({
        ...EMPTY_EMPLOYEE_STATE,
        ...(typeof prev === 'object' && prev !== null ? prev : {}),
        userId: '',
        userEmail: '',
        userName: '',
        userRole: '',
      }));
      return;
    }

    const selected = eligibleUsers.find(
      (user) => String(user.id) === String(value)
    );

    setManagedEmployee((prev) => ({
      ...EMPTY_EMPLOYEE_STATE,
      ...(typeof prev === 'object' && prev !== null ? prev : {}),
      userId: selected ? String(selected.id) : String(value),
      userEmail: selected?.email || '',
      userName: selected?.name || '',
      userRole: (selected?.role || '').toLowerCase(),
    }));
  };

  const handleSave = async () => {
    try {
      if (isCreating) {
        if (!canAddEmployees) {
          return;
        }
        const created = await onAddEmployee(normalizedEmployee);
        if (created && created.id) {
          setIsCreating(false);
          setSelectedEmployeeId(String(created.id));
          setManagedEmployee(mapEmployeeToDialogState(created));
        }
        return;
      }

      if (!normalizedEmployee.id || typeof onUpdateEmployee !== 'function') {
        return;
      }
      await onUpdateEmployee(normalizedEmployee);
    } catch (error) {
      console.error(error);
    }
  };

  const userSelectValue =
    normalizedEmployee.userId && normalizedEmployee.userId !== ''
      ? normalizedEmployee.userId
      : '__none__';
  const linkedUserLabel = normalizedEmployee.userId
    ? normalizedEmployee.userEmail
      ? `${normalizedEmployee.userName || normalizedEmployee.userEmail} (${
          normalizedEmployee.userEmail
        })`
      : normalizedEmployee.userName || normalizedEmployee.userId
    : 'Not linked to any user';
  const isLinkedUserInOptions = normalizedEmployee.userId
    ? eligibleUsers.some(
        (user) => String(user.id) === String(normalizedEmployee.userId)
      )
    : false;
  const linkedUserClass = normalizedEmployee.userId
    ? 'col-span-3 text-primary leading-5'
    : 'col-span-3 text-muted-foreground leading-5';

  const startCreate = () => {
    if (!canAddEmployees) return;
    setIsCreating(true);
    setSelectedEmployeeId('');
    setManagedEmployee({ ...EMPTY_EMPLOYEE_STATE });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {showTrigger && (
        <DialogTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Users size={16} /> Manage Employees
          </Button>
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isCreating ? 'Add Employee' : 'Edit Employee'}
          </DialogTitle>
          <DialogDescription>
            {isCreating
              ? 'Create a new employee record that can be scheduled and tracked.'
              : 'Update employee information that powers schedules and attendance.'}
          </DialogDescription>
        </DialogHeader>
        {canAddEmployees ? (
          <div className="flex justify-end pb-2">
            <Button
              variant="outline"
              size="sm"
              onClick={startCreate}
              disabled={!canAddEmployees || isCreating}
            >
              Add New Employee
            </Button>
          </div>
        ) : null}
        {isCreating || hasEmployees ? (
          <div className="grid gap-4 py-4">
            {hasEmployees ? (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="employee" className="text-right">
                  Employee
                </Label>
                <Select
                  value={isCreating ? '' : selectedEmployeeId}
                  onValueChange={handleSelectEmployee}
                  disabled={isCreating}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select an employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employeeList.map((employee) => (
                      <SelectItem key={employee.id} value={String(employee.id)}>
                        {employee.name} ({employee.position || 'No position'})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="rounded-md border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground">
                No employees found yet. Complete the form below to add the first
                employee.
              </div>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={normalizedEmployee.name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="position" className="text-right">
                Position
              </Label>
              <Input
                id="position"
                value={normalizedEmployee.position}
                onChange={(e) => handleFieldChange('position', e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="hourlyRate" className="text-right">
                Hourly Rate
              </Label>
              <Input
                id="hourlyRate"
                type="number"
                value={
                  normalizedEmployee.hourlyRate === null ||
                  normalizedEmployee.hourlyRate === undefined
                    ? ''
                    : normalizedEmployee.hourlyRate
                }
                onChange={(e) =>
                  handleFieldChange('hourlyRate', e.target.value)
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="contact" className="text-right">
                Contact
              </Label>
              <Input
                id="contact"
                value={normalizedEmployee.contact || ''}
                onChange={(e) => handleFieldChange('contact', e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="employee-user" className="text-right">
                Linked User
              </Label>
              <Select value={userSelectValue} onValueChange={handleSelectUser}>
                <SelectTrigger id="employee-user" className="col-span-3">
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Unassigned</SelectItem>
                  {eligibleUsers.map((user) => {
                    const roleLabel = user.role
                      ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
                      : '';
                    return (
                      <SelectItem key={user.id} value={String(user.id)}>
                        {user.name} {roleLabel ? `(${roleLabel})` : ''} &lt;
                        {user.email}&gt;
                      </SelectItem>
                    );
                  })}
                  {!isLinkedUserInOptions && normalizedEmployee.userId ? (
                    <SelectItem value={normalizedEmployee.userId} disabled>
                      {linkedUserLabel}
                    </SelectItem>
                  ) : null}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-start gap-4 text-xs text-muted-foreground">
              <span className="text-right font-medium leading-5">
                Available Users
              </span>
              <div className="col-span-3 flex flex-col gap-1 max-h-32 overflow-y-auto">
                {eligibleUsers.length > 0 ? (
                  eligibleUsers.map((user) => {
                    const roleLabel = user.role
                      ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
                      : '';
                    return (
                      <span key={user.id}>
                        {user.name} ({roleLabel || 'Unknown role'}) -{' '}
                        {user.email}
                      </span>
                    );
                  })
                ) : (
                  <span>No manager or staff accounts available.</span>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 items-start gap-4 text-xs">
              <span className="text-right font-medium text-muted-foreground leading-5">
                Linked To
              </span>
              <span className={linkedUserClass}>{linkedUserLabel}</span>
            </div>
          </div>
        ) : (
          <div className="py-6 text-sm text-muted-foreground">
            No employees available to edit. Add employee records from the admin
            panel first.
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={
              (isCreating && !canAddEmployees) ||
              (!isCreating && (!hasEmployees || !normalizedEmployee.id))
            }
          >
            {isCreating ? 'Add Employee' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ManageEmployeesDialog;
