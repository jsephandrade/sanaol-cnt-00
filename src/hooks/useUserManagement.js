import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import userService from '@/api/services/userService';

export const useUserManagement = (params = {}) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const { toast } = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await userService.getUsers(params);
      
      if (response.success) {
        setUsers(response.data);
        setPagination(response.pagination);
      } else {
        throw new Error('Failed to fetch users');
      }
    } catch (error) {
      setError(error.message);
      toast({
        title: 'Error Loading Users',
        description: 'Failed to load users. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [JSON.stringify(params)]);

  const createUser = async (userData) => {
    try {
      const response = await userService.createUser(userData);
      
      if (response.success) {
        setUsers(prev => [...prev, response.data]);
        toast({
          title: 'User Created',
          description: `${userData.name} has been added successfully.`,
        });
        return response.data;
      } else {
        throw new Error('Failed to create user');
      }
    } catch (error) {
      toast({
        title: 'Error Creating User',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateUser = async (userId, updates) => {
    try {
      const response = await userService.updateUser(userId, updates);
      
      if (response.success) {
        setUsers(prev => 
          prev.map(user => 
            user.id === userId ? { ...user, ...response.data } : user
          )
        );
        toast({
          title: 'User Updated',
          description: 'User information has been updated successfully.',
        });
        return response.data;
      } else {
        throw new Error('Failed to update user');
      }
    } catch (error) {
      toast({
        title: 'Error Updating User',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const deleteUser = async (userId) => {
    try {
      const response = await userService.deleteUser(userId);
      
      if (response.success) {
        setUsers(prev => prev.filter(user => user.id !== userId));
        toast({
          title: 'User Deleted',
          description: 'User has been removed from the system.',
          variant: 'destructive',
        });
        return true;
      } else {
        throw new Error('Failed to delete user');
      }
    } catch (error) {
      toast({
        title: 'Error Deleting User',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateUserStatus = async (userId, status) => {
    try {
      const response = await userService.updateUserStatus(userId, status);
      
      if (response.success) {
        setUsers(prev => 
          prev.map(user => 
            user.id === userId ? { ...user, status } : user
          )
        );
        toast({
          title: `User ${status === 'active' ? 'Activated' : 'Deactivated'}`,
          description: `User status has been updated to ${status}.`,
        });
        return response.data;
      } else {
        throw new Error('Failed to update user status');
      }
    } catch (error) {
      toast({
        title: 'Error Updating Status',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateUserRole = async (userId, role) => {
    try {
      const response = await userService.updateUserRole(userId, role);
      
      if (response.success) {
        setUsers(prev => 
          prev.map(user => 
            user.id === userId ? { ...user, role } : user
          )
        );
        toast({
          title: 'Role Updated',
          description: `User role has been updated to ${role}.`,
        });
        return response.data;
      } else {
        throw new Error('Failed to update user role');
      }
    } catch (error) {
      toast({
        title: 'Error Updating Role',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const refetch = () => {
    fetchUsers();
  };

  return {
    users,
    loading,
    error,
    pagination,
    createUser,
    updateUser,
    deleteUser,
    updateUserStatus,
    updateUserRole,
    refetch,
  };
};

export const useRoles = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  const fetchRoles = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await userService.getRoles();
      
      if (response.success) {
        setRoles(response.data);
      } else {
        throw new Error('Failed to fetch roles');
      }
    } catch (error) {
      setError(error.message);
      toast({
        title: 'Error Loading Roles',
        description: 'Failed to load user roles. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const refetch = () => {
    fetchRoles();
  };

  return {
    roles,
    loading,
    error,
    refetch,
  };
};

export default useUserManagement;