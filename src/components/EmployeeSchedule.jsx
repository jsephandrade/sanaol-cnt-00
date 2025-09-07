import React, { useState } from 'react';
import { employees, scheduleData } from '@/utils/mockData';
import { toast } from 'sonner';
import ManageEmployeesDialog from '@/components/employee-schedule/ManageEmployeesDialog';
import AddScheduleDialog from '@/components/employee-schedule/AddScheduleDialog';
import WeeklyScheduleCard from '@/components/employee-schedule/WeeklyScheduleCard';
import CalendarViewCard from '@/components/employee-schedule/CalendarViewCard';
import StaffOverviewCard from '@/components/employee-schedule/StaffOverviewCard';
import EditScheduleDialog from '@/components/employee-schedule/EditScheduleDialog';

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
        <h2 className="text-2xl font-semibold">Employee Schedule</h2>
        <div className="flex gap-2">
          <ManageEmployeesDialog
            open={employeeDialogOpen}
            onOpenChange={setEmployeeDialogOpen}
            newEmployee={newEmployee}
            setNewEmployee={setNewEmployee}
            onAddEmployee={handleAddEmployee}
          />

          <AddScheduleDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            newScheduleEntry={newScheduleEntry}
            setNewScheduleEntry={setNewScheduleEntry}
            employeeList={employeeList}
            daysOfWeek={daysOfWeek}
            onAddSchedule={handleAddSchedule}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <WeeklyScheduleCard
            daysOfWeek={daysOfWeek}
            employeeList={employeeList}
            schedule={schedule}
            onEditSchedule={setEditingSchedule}
            onDeleteSchedule={handleDeleteSchedule}
            onAddScheduleForDay={(employeeId, day) => {
              setNewScheduleEntry({
                employeeId,
                day,
                startTime: '',
                endTime: '',
              });
              setDialogOpen(true);
            }}
          />
        </div>
        <CalendarViewCard date={date} setDate={setDate} schedule={schedule} />
      </div>

      {/* Employee Summary */}
      <StaffOverviewCard employeeList={employeeList} schedule={schedule} />

      {/* Edit Dialog */}
      <EditScheduleDialog
        editingSchedule={editingSchedule}
        setEditingSchedule={setEditingSchedule}
        daysOfWeek={daysOfWeek}
        employeeList={employeeList}
        onSave={handleEditSchedule}
      />
    </div>
  );
};

export default EmployeeSchedule;
