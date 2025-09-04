import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { Calendar } from '@/components/ui/calendar';
import { employees, scheduleData } from '@/utils/mockData';
import { Edit, Plus, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

const EmployeeSchedule = () => {
  const [schedule, setSchedule] = useState(scheduleData);
  const [employeeList, setEmployeeList] = useState(employees);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [employeeDialogOpen, setEmployeeDialogOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    position: '',
    hourlyRate: 0,
    contact: '',
  });
  const [date, setDate] = React.useState(new Date());
  const [newScheduleEntry, setNewScheduleEntry] = useState({
    employeeId: '',
    employeeName: '',
    day: '',
    startTime: '',
    endTime: '',
  });

  const daysOfWeek = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  const handleAddSchedule = () => {
    if (
      !newScheduleEntry.employeeId ||
      !newScheduleEntry.day ||
      !newScheduleEntry.startTime ||
      !newScheduleEntry.endTime
    ) {
      toast.error('Please fill in all required fields');
      return;
    }

    const employee = employeeList.find(
      (emp) => emp.id === newScheduleEntry.employeeId
    );
    if (!employee) {
      toast.error('Employee not found');
      return;
    }

    const scheduleToAdd = {
      ...newScheduleEntry,
      id: `${schedule.length + 1}`,
      employeeName: employee.name,
    };

    setSchedule([...schedule, scheduleToAdd]);
    setNewScheduleEntry({
      employeeId: '',
      employeeName: '',
      day: '',
      startTime: '',
      endTime: '',
    });

    setDialogOpen(false);
    toast.success('Schedule entry added successfully');
  };

  const handleEditSchedule = () => {
    if (!editingSchedule) return;

    const updatedSchedule = schedule.map((entry) =>
      entry.id === editingSchedule.id ? editingSchedule : entry
    );

    setSchedule(updatedSchedule);
    setEditingSchedule(null);
    toast.success('Schedule updated successfully');
  };

  const handleDeleteSchedule = (id) => {
    setSchedule(schedule.filter((entry) => entry.id !== id));
    toast.success('Schedule entry deleted successfully');
  };

  const handleAddEmployee = () => {
    if (!newEmployee.name || !newEmployee.position || !newEmployee.contact) {
      toast.error('Please fill in all required fields');
      return;
    }

    const employeeToAdd = {
      ...newEmployee,
      id: `${employeeList.length + 1}`,
      hourlyRate: Number(newEmployee.hourlyRate),
      avatar: '/placeholder.svg',
    };

    setEmployeeList([...employeeList, employeeToAdd]);
    setNewEmployee({
      name: '',
      position: '',
      hourlyRate: 0,
      contact: '',
    });

    setEmployeeDialogOpen(false);
    toast.success('Employee added successfully');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-semibold">Employee Schedule</h2>
        <div className="flex gap-2">
          <Dialog
            open={employeeDialogOpen}
            onOpenChange={setEmployeeDialogOpen}
          >
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Users size={16} /> Manage Employees
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Employee</DialogTitle>
                <DialogDescription>
                  Add a new employee to your canteen staff.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={newEmployee.name}
                    onChange={(e) =>
                      setNewEmployee({ ...newEmployee, name: e.target.value })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="position" className="text-right">
                    Position
                  </Label>
                  <Input
                    id="position"
                    value={newEmployee.position}
                    onChange={(e) =>
                      setNewEmployee({
                        ...newEmployee,
                        position: e.target.value,
                      })
                    }
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
                    value={newEmployee.hourlyRate}
                    onChange={(e) =>
                      setNewEmployee({
                        ...newEmployee,
                        hourlyRate: parseFloat(e.target.value),
                      })
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
                    value={newEmployee.contact}
                    onChange={(e) =>
                      setNewEmployee({
                        ...newEmployee,
                        contact: e.target.value,
                      })
                    }
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setEmployeeDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddEmployee}>Add Employee</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus size={16} /> Add Schedule
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Schedule</DialogTitle>
                <DialogDescription>
                  Schedule an employee for a shift.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="employee" className="text-right">
                    Employee
                  </Label>
                  <Select
                    onValueChange={(value) =>
                      setNewScheduleEntry({
                        ...newScheduleEntry,
                        employeeId: value,
                      })
                    }
                    value={newScheduleEntry.employeeId}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select an employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employeeList.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.name} ({employee.position})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="day" className="text-right">
                    Day
                  </Label>
                  <Select
                    onValueChange={(value) =>
                      setNewScheduleEntry({ ...newScheduleEntry, day: value })
                    }
                    value={newScheduleEntry.day}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a day" />
                    </SelectTrigger>
                    <SelectContent>
                      {daysOfWeek.map((day) => (
                        <SelectItem key={day} value={day}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="startTime" className="text-right">
                    Start Time
                  </Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={newScheduleEntry.startTime}
                    onChange={(e) =>
                      setNewScheduleEntry({
                        ...newScheduleEntry,
                        startTime: e.target.value,
                      })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="endTime" className="text-right">
                    End Time
                  </Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={newScheduleEntry.endTime}
                    onChange={(e) =>
                      setNewScheduleEntry({
                        ...newScheduleEntry,
                        endTime: e.target.value,
                      })
                    }
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddSchedule}>Add Schedule</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Schedule</CardTitle>
              <CardDescription>
                Employee shifts for the current week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <div className="w-full">
                  {/* Header Row */}
                  <div className="grid grid-cols-8 gap-2 mb-4 pb-2 border-b">
                    <div className="col-span-1 font-semibold text-left">
                      Employee
                    </div>
                    {daysOfWeek.map((day) => (
                      <div
                        key={day}
                        className="text-center font-semibold text-sm"
                      >
                        {day.slice(0, 3)}
                      </div>
                    ))}
                  </div>

                  {/* Schedule Rows */}
                  <div className="space-y-3">
                    {employeeList.map((employee) => (
                      <div
                        key={employee.id}
                        className="grid grid-cols-8 gap-1 items-center min-h-[40px]"
                      >
                        <div className="col-span-1 flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                            {employee.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <span className="font-medium text-xs truncate block">
                              {employee.name}
                            </span>
                            <span className="text-[10px] text-muted-foreground truncate block">
                              {employee.position}
                            </span>
                          </div>
                        </div>

                        {daysOfWeek.map((day) => {
                          const entry = schedule.find(
                            (s) => s.employeeId === employee.id && s.day === day
                          );

                          return (
                            <div
                              key={day}
                              className="flex items-center justify-center"
                            >
                              {entry ? (
                                <div className="bg-primary/10 border border-primary/20 p-1 rounded w-full text-[10px]">
                                  <div className="text-center font-medium">
                                    {entry.startTime} - {entry.endTime}
                                  </div>
                                  <div className="flex gap-1 justify-center">
                                    <button
                                      onClick={() => setEditingSchedule(entry)}
                                      className="text-primary hover:text-primary/80 p-0.5"
                                      title="Edit schedule"
                                    >
                                      <Edit size={10} />
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDeleteSchedule(entry.id)
                                      }
                                      className="text-destructive hover:text-destructive/80 p-0.5"
                                      title="Delete schedule"
                                    >
                                      <Trash2 size={10} />
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="border border-dashed border-muted rounded-md w-full h-8 flex items-center justify-center hover:border-primary/30">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 hover:bg-primary/10"
                                    onClick={() => {
                                      setNewScheduleEntry({
                                        employeeId: employee.id,
                                        day: day,
                                        startTime: '',
                                        endTime: '',
                                      });
                                      setDialogOpen(true);
                                    }}
                                    title={`Add schedule for ${day}`}
                                  >
                                    <Plus size={10} />
                                  </Button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Calendar View</CardTitle>
            <CardDescription>Monthly schedule overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="border rounded-md"
            />

            {date && (
              <div>
                <h4 className="font-medium mb-2">
                  {date.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </h4>
                <div className="space-y-2">
                  {schedule
                    .filter(
                      (entry) =>
                        entry.day ===
                        date.toLocaleDateString('en-US', { weekday: 'long' })
                    )
                    .map((entry) => (
                      <div
                        key={entry.id}
                        className="flex justify-between items-center p-2 bg-muted rounded"
                      >
                        <div>
                          <p className="font-medium">{entry.employeeName}</p>
                          <p className="text-sm text-muted-foreground">
                            {entry.startTime} - {entry.endTime}
                          </p>
                        </div>
                        <Badge variant="outline">{entry.day}</Badge>
                      </div>
                    ))}

                  {schedule.filter(
                    (entry) =>
                      entry.day ===
                      date.toLocaleDateString('en-US', { weekday: 'long' })
                  ).length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No schedules for this day
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Employee Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Staff Overview</CardTitle>
          <CardDescription>
            Current team members and their positions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {employeeList.map((employee) => (
              <div
                key={employee.id}
                className="bg-card border rounded-lg p-4 flex flex-col"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mr-3 text-lg font-semibold">
                    {employee.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold">{employee.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {employee.position}
                    </p>
                  </div>
                </div>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Hourly Rate:</span>
                    <span>${employee.hourlyRate.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Contact:</span>
                    <span className="truncate max-w-[150px]">
                      {employee.contact}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Weekly Hours:</span>
                    <span>
                      {schedule
                        .filter((entry) => entry.employeeId === employee.id)
                        .reduce((total, entry) => {
                          const start = new Date(
                            `1970-01-01T${entry.startTime}`
                          );
                          const end = new Date(`1970-01-01T${entry.endTime}`);
                          const diffHours =
                            (end.getTime() - start.getTime()) /
                            (1000 * 60 * 60);
                          return total + diffHours;
                        }, 0)
                        .toFixed(1)}
                      h
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {editingSchedule && (
        <Dialog
          open={!!editingSchedule}
          onOpenChange={(open) => !open && setEditingSchedule(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Schedule</DialogTitle>
              <DialogDescription>
                Update the employee's schedule.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-employee" className="text-right">
                  Employee
                </Label>
                <Select
                  onValueChange={(value) => {
                    const employee = employeeList.find(
                      (emp) => emp.id === value
                    );
                    setEditingSchedule({
                      ...editingSchedule,
                      employeeId: value,
                      employeeName: employee?.name || '',
                    });
                  }}
                  value={editingSchedule.employeeId}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select an employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employeeList.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.name} ({employee.position})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-day" className="text-right">
                  Day
                </Label>
                <Select
                  onValueChange={(value) =>
                    setEditingSchedule({ ...editingSchedule, day: value })
                  }
                  value={editingSchedule.day}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a day" />
                  </SelectTrigger>
                  <SelectContent>
                    {daysOfWeek.map((day) => (
                      <SelectItem key={day} value={day}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-startTime" className="text-right">
                  Start Time
                </Label>
                <Input
                  id="edit-startTime"
                  type="time"
                  value={editingSchedule.startTime}
                  onChange={(e) =>
                    setEditingSchedule({
                      ...editingSchedule,
                      startTime: e.target.value,
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-endTime" className="text-right">
                  End Time
                </Label>
                <Input
                  id="edit-endTime"
                  type="time"
                  value={editingSchedule.endTime}
                  onChange={(e) =>
                    setEditingSchedule({
                      ...editingSchedule,
                      endTime: e.target.value,
                    })
                  }
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setEditingSchedule(null)}
              >
                Cancel
              </Button>
              <Button onClick={handleEditSchedule}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default EmployeeSchedule;
