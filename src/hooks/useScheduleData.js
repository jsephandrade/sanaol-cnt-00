import { useState } from 'react';
import { employees, scheduleData } from '@/utils/mockData';

export const useScheduleData = () => {
  const [schedule, setSchedule] = useState(scheduleData);
  const [employeeList, setEmployeeList] = useState(employees);

  const daysOfWeek = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  // Calculate weekly hours for an employee
  const calculateWeeklyHours = (employeeId) => {
    return schedule
      .filter((entry) => entry.employeeId === employeeId)
      .reduce((total, entry) => {
        const start = new Date(`1970-01-01T${entry.startTime}`);
        const end = new Date(`1970-01-01T${entry.endTime}`);
        const diffHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        return total + diffHours;
      }, 0);
  };

  // Get schedules for a specific day
  const getSchedulesForDay = (day) => {
    return schedule.filter((entry) => entry.day === day);
  };

  // Get schedule entry for specific employee and day
  const getScheduleEntry = (employeeId, day) => {
    return schedule.find((s) => s.employeeId === employeeId && s.day === day);
  };

  return {
    schedule,
    setSchedule,
    employeeList,
    setEmployeeList,
    daysOfWeek,
    calculateWeeklyHours,
    getSchedulesForDay,
    getScheduleEntry,
  };
};