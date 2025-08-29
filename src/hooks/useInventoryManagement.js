import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import inventoryService from '@/api/services/inventoryService';

export const useInventoryManagement = (params = {}) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const { toast } = useToast();

  const fetchInventoryItems = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await inventoryService.getInventoryItems(params);
      
      if (response.success) {
        setItems(response.data);
        setPagination(response.pagination);
      } else {
        throw new Error('Failed to fetch inventory items');
      }
    } catch (error) {
      setError(error.message);
      toast({
        title: 'Error Loading Inventory',
        description: 'Failed to load inventory items. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryItems();
  }, [JSON.stringify(params)]);

  const createInventoryItem = async (itemData) => {
    try {
      const response = await inventoryService.createInventoryItem(itemData);
      
      if (response.success) {
        setItems(prev => [...prev, response.data]);
        toast({
          title: 'Inventory Item Created',
          description: `${itemData.name} has been added to inventory.`,
        });
        return response.data;
      } else {
        throw new Error('Failed to create inventory item');
      }
    } catch (error) {
      toast({
        title: 'Error Creating Item',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateInventoryItem = async (itemId, updates) => {
    try {
      const response = await inventoryService.updateInventoryItem(itemId, updates);
      
      if (response.success) {
        setItems(prev => 
          prev.map(item => 
            item.id === itemId ? { ...item, ...response.data } : item
          )
        );
        toast({
          title: 'Inventory Item Updated',
          description: 'Inventory item has been updated successfully.',
        });
        return response.data;
      } else {
        throw new Error('Failed to update inventory item');
      }
    } catch (error) {
      toast({
        title: 'Error Updating Item',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const deleteInventoryItem = async (itemId) => {
    try {
      const response = await inventoryService.deleteInventoryItem(itemId);
      
      if (response.success) {
        setItems(prev => prev.filter(item => item.id !== itemId));
        toast({
          title: 'Inventory Item Deleted',
          description: 'Inventory item has been removed.',
          variant: 'destructive',
        });
        return true;
      } else {
        throw new Error('Failed to delete inventory item');
      }
    } catch (error) {
      toast({
        title: 'Error Deleting Item',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateStock = async (itemId, quantity, operation = 'set') => {
    try {
      const response = await inventoryService.updateStock(itemId, quantity, operation);
      
      if (response.success) {
        setItems(prev => 
          prev.map(item => 
            item.id === itemId ? { ...item, ...response.data } : item
          )
        );
        
        const operationText = {
          'add': 'restocked',
          'subtract': 'reduced',
          'set': 'updated'
        }[operation];
        
        toast({
          title: 'Stock Updated',
          description: `Stock has been ${operationText} successfully.`,
        });
        return response.data;
      } else {
        throw new Error('Failed to update stock');
      }
    } catch (error) {
      toast({
        title: 'Error Updating Stock',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const refetch = () => {
    fetchInventoryItems();
  };

  return {
    items,
    loading,
    error,
    pagination,
    createInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    updateStock,
    refetch,
  };
};

export const useLowStockItems = (threshold) => {
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  const fetchLowStockItems = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await inventoryService.getLowStockItems(threshold);
      
      if (response.success) {
        setLowStockItems(response.data);
      } else {
        throw new Error('Failed to fetch low stock items');
      }
    } catch (error) {
      setError(error.message);
      toast({
        title: 'Error Loading Low Stock Items',
        description: 'Failed to load low stock items. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (threshold !== undefined) {
      fetchLowStockItems();
    }
  }, [threshold]);

  const refetch = () => {
    fetchLowStockItems();
  };

  return {
    lowStockItems,
    loading,
    error,
    refetch,
  };
};

export const useInventoryActivities = (params = {}) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  const fetchInventoryActivities = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await inventoryService.getInventoryActivities(params);
      
      if (response.success) {
        setActivities(response.data);
      } else {
        throw new Error('Failed to fetch inventory activities');
      }
    } catch (error) {
      setError(error.message);
      toast({
        title: 'Error Loading Activities',
        description: 'Failed to load inventory activities. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryActivities();
  }, [JSON.stringify(params)]);

  const refetch = () => {
    fetchInventoryActivities();
  };

  return {
    activities,
    loading,
    error,
    refetch,
  };
};

export default useInventoryManagement;