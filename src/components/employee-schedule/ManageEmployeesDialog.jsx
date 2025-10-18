import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Users } from 'lucide-react';

const ManageEmployeesDialog = ({
  open,
  onOpenChange,
  employees = [],
  onUpdateEmployee,
  showTrigger = true,
}) => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [formState, setFormState] = useState({
    name: '',
    position: '',
    hourlyRate: '',
    contact: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  const sortedEmployees = useMemo(
    () =>
      [...employees].sort((a, b) =>
        (a?.name || '').localeCompare(b?.name || '', undefined, {
          sensitivity: 'base',
        })
      ),
    [employees]
  );

  useEffect(() => {
    if (!open) return;

    if (!sortedEmployees.length) {
      setSelectedEmployeeId('');
      setFormState({
        name: '',
        position: '',
        hourlyRate: '',
        contact: '',
      });
      return;
    }

    setSelectedEmployeeId((prev) => {
      if (prev && sortedEmployees.some((emp) => String(emp.id) === prev)) {
        return prev;
      }
      const firstId = sortedEmployees[0]?.id;
      return firstId != null ? String(firstId) : '';
    });
  }, [open, sortedEmployees]);

  useEffect(() => {
    if (!selectedEmployeeId) {
      setFormState({
        name: '',
        position: '',
        hourlyRate: '',
        contact: '',
      });
      return;
    }

    const employee = sortedEmployees.find(
      (emp) => String(emp.id) === selectedEmployeeId
    );
    if (!employee) return;

    setFormState({
      name: employee.name || '',
      position: employee.position || '',
      hourlyRate:
        employee.hourlyRate !== undefined && employee.hourlyRate !== null
          ? String(employee.hourlyRate)
          : '',
      contact: employee.contact || '',
    });
  }, [selectedEmployeeId, sortedEmployees]);

  const handleInputChange = (field) => (event) => {
    const value = event?.target?.value ?? '';
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    if (!selectedEmployeeId) {
      toast.warning('Select an employee to edit.');
      return;
    }

    const name = formState.name.trim();
    const position = formState.position.trim();

    if (!name || !position) {
      toast.error('Name and position are required.');
      return;
    }

    const parsedRate = Number.parseFloat(formState.hourlyRate);
    const hourlyRate = Number.isFinite(parsedRate) ? parsedRate : 0;
    const payload = {
      name,
      position,
      hourlyRate,
      contact: formState.contact.trim(),
    };

    setIsSaving(true);
    try {
      await onUpdateEmployee?.(selectedEmployeeId, payload);
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const hasEmployees = sortedEmployees.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {showTrigger && (
        <DialogTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Users size={16} /> Edit Employee
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Edit Employee</DialogTitle>
          <DialogDescription>
            Update details for existing team members.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="employee" className="text-right">
              Employee
            </Label>
            <div className="col-span-3">
              <Select
                value={selectedEmployeeId || undefined}
                onValueChange={setSelectedEmployeeId}
                disabled={!hasEmployees || isSaving}
              >
                <SelectTrigger id="employee">
                  <SelectValue
                    placeholder={
                      hasEmployees
                        ? 'Select employee'
                        : 'No employees available'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {sortedEmployees.map((employee) => (
                    <SelectItem key={employee.id} value={String(employee.id)}>
                      {employee.position
                        ? `${employee.name} (${employee.position})`
                        : employee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={formState.name}
              onChange={handleInputChange('name')}
              className="col-span-3"
              disabled={isSaving || !hasEmployees}
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="position" className="text-right">
              Position
            </Label>
            <Input
              id="position"
              value={formState.position}
              onChange={handleInputChange('position')}
              className="col-span-3"
              disabled={isSaving || !hasEmployees}
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="hourlyRate" className="text-right">
              Hourly Rate
            </Label>
            <Input
              id="hourlyRate"
              type="number"
              value={formState.hourlyRate}
              onChange={handleInputChange('hourlyRate')}
              className="col-span-3"
              min={0}
              step="0.01"
              disabled={isSaving || !hasEmployees}
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="contact" className="text-right">
              Contact
            </Label>
            <Input
              id="contact"
              value={formState.contact}
              onChange={handleInputChange('contact')}
              className="col-span-3"
              disabled={isSaving || !hasEmployees}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={
              isSaving ||
              !hasEmployees ||
              !formState.name.trim() ||
              !formState.position.trim()
            }
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ManageEmployeesDialog;
