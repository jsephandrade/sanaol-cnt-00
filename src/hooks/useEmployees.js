import { useState, useEffect } from 'react';
import { employeeService } from '@/services/employeeService';
import { toast } from 'sonner';

export const useEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await employeeService.getEmployees();
      setEmployees(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch employees';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const addEmployee = async (employee) => {
    try {
      const newEmployee = await employeeService.createEmployee(employee);
      setEmployees((prev) => [...prev, newEmployee]);
      toast.success('Employee added successfully');
      return newEmployee;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to add employee';
      toast.error(errorMessage);
      throw err;
    }
  };

  const updateEmployee = async (id, updates) => {
    try {
      const updatedEmployee = await employeeService.updateEmployee(id, updates);
      setEmployees((prev) =>
        prev.map((emp) => (emp.id === id ? updatedEmployee : emp))
      );
      toast.success('Employee updated successfully');
      return updatedEmployee;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to update employee';
      toast.error(errorMessage);
      throw err;
    }
  };

  const deleteEmployee = async (id) => {
    try {
      await employeeService.deleteEmployee(id);
      setEmployees((prev) => prev.filter((emp) => emp.id !== id));
      toast.success('Employee deleted successfully');
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to delete employee';
      toast.error(errorMessage);
      throw err;
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return {
    employees,
    loading,
    error,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    refetch: fetchEmployees,
  };
};

export const useSchedule = () => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await employeeService.getSchedule();
      setSchedule(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch schedule';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateScheduleEntry = async (id, updates) => {
    try {
      const updatedEntry = await employeeService.updateSchedule(id, updates);
      setSchedule((prev) =>
        prev.map((entry) => (entry.id === id ? updatedEntry : entry))
      );
      toast.success('Schedule updated successfully');
      return updatedEntry;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to update schedule';
      toast.error(errorMessage);
      throw err;
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  return {
    schedule,
    loading,
    error,
    updateScheduleEntry,
    refetch: fetchSchedule,
  };
};
