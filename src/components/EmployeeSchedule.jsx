import React, { useState } from 'react';
import { toast } from 'sonner';
import { useScheduleData } from '@/hooks/useScheduleData';
import AddEmployeeModal from '@/components/schedule/AddEmployeeModal';
import AddScheduleModal from '@/components/schedule/AddScheduleModal';
import EditScheduleModal from '@/components/schedule/EditScheduleModal';
import { ScheduleCalendar } from '@/components/schedule/ScheduleCalendar';
import { ScheduleGrid } from '@/components/schedule/ScheduleGrid';
import StaffSummary from '@/components/schedule/StaffSummary';

const EmployeeSchedule = () => {
  const {
    schedule,
    setSchedule,
    employeeList,
    setEmployeeList,
    daysOfWeek,
    calculateWeeklyHours,
    getSchedulesForDay,
    getScheduleEntry,
  } = useScheduleData();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [employeeDialogOpen, setEmployeeDialogOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    position: '',
    hourlyRate: 0,
    contact: '',
  });
  const [newScheduleEntry, setNewScheduleEntry] = useState({
    employeeId: '',
    employeeName: '',
    day: '',
    startTime: '',
    endTime: '',
  });

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
          <AddEmployeeModal
            open={employeeDialogOpen}
            onOpenChange={setEmployeeDialogOpen}
            newEmployee={newEmployee}
            setNewEmployee={setNewEmployee}
            onAddEmployee={handleAddEmployee}
          />

          <AddScheduleModal
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
          <ScheduleGrid
            employeeList={employeeList}
            daysOfWeek={daysOfWeek}
            getScheduleEntry={getScheduleEntry}
            onEditSchedule={setEditingSchedule}
            onDeleteSchedule={handleDeleteSchedule}
            onQuickAdd={(employeeId, day) => {
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

        <ScheduleCalendar getSchedulesForDay={getSchedulesForDay} />
      </div>

      <StaffSummary 
        employeeList={employeeList} 
        calculateWeeklyHours={calculateWeeklyHours} 
      />

      <EditScheduleModal
        editingSchedule={editingSchedule}
        setEditingSchedule={setEditingSchedule}
        employeeList={employeeList}
        daysOfWeek={daysOfWeek}
        onEditSchedule={handleEditSchedule}
      />
    </div>
  );
};

export default EmployeeSchedule;
