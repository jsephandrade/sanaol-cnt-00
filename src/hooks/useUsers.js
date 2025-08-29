import { useState, useEffect } from 'react';
import { userService } from '@/services/userService';
import { toast } from 'sonner';

export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getUsers();
      setUsers(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch users';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const addUser = async (user) => {
    try {
      const newUser = await userService.createUser(user);
      setUsers((prev) => [...prev, newUser]);
      toast.success('User added successfully');
      return newUser;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to add user';
      toast.error(errorMessage);
      throw err;
    }
  };

  const updateUser = async (id, updates) => {
    try {
      const updatedUser = await userService.updateUser(id, updates);
      setUsers((prev) =>
        prev.map((user) => (user.id === id ? updatedUser : user))
      );
      toast.success('User updated successfully');
      return updatedUser;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to update user';
      toast.error(errorMessage);
      throw err;
    }
  };

  const deleteUser = async (id) => {
    try {
      await userService.deleteUser(id);
      setUsers((prev) => prev.filter((user) => user.id !== id));
      toast.success('User deleted successfully');
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to delete user';
      toast.error(errorMessage);
      throw err;
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    error,
    addUser,
    updateUser,
    deleteUser,
    refetch: fetchUsers,
  };
};

export const useUserLogs = (params) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getUserLogs(params);
      setLogs(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch user logs';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [params?.type, params?.timeRange]);

  return {
    logs,
    loading,
    error,
    refetch: fetchLogs,
  };
};
