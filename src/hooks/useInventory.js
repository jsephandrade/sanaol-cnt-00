import { useState, useEffect } from 'react';
import { inventoryService } from '@/api/services/inventoryService';
import { toast } from 'sonner';

export const useInventory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await inventoryService.getInventoryItems();
      if (response?.success) {
        setItems(response.data || []);
      } else if (Array.isArray(response)) {
        // Fallback in case service returns raw array
        setItems(response);
      } else {
        throw new Error('Failed to fetch inventory');
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch inventory';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const addInventoryItem = async (item) => {
    try {
      const response = await inventoryService.createInventoryItem(item);
      const newItem = response?.data ?? response;
      setItems((prev) => [...prev, newItem]);
      toast.success('Inventory item added successfully');
      return newItem;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to add inventory item';
      toast.error(errorMessage);
      throw err;
    }
  };

  const updateInventoryItem = async (id, updates) => {
    try {
      const res = await inventoryService.updateInventoryItem(id, updates);
      const updatedItem = res?.data ?? res;
      setItems((prev) =>
        prev.map((item) => (item.id === id ? updatedItem : item))
      );
      toast.success('Inventory item updated successfully');
      return updatedItem;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to update inventory item';
      toast.error(errorMessage);
      throw err;
    }
  };

  const deleteInventoryItem = async (id) => {
    try {
      const response = await inventoryService.deleteInventoryItem(id);
      if (response?.success !== false) {
        setItems((prev) => prev.filter((item) => item.id !== id));
      } else {
        throw new Error('Failed to delete inventory item');
      }
      toast.success('Inventory item deleted successfully');
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to delete inventory item';
      toast.error(errorMessage);
      throw err;
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  return {
    items,
    loading,
    error,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    refetch: fetchInventory,
  };
};

export const useInventoryActivities = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await inventoryService.getInventoryActivities();
      if (response?.success) {
        setActivities(response.data || []);
      } else if (Array.isArray(response)) {
        setActivities(response);
      } else {
        throw new Error('Failed to fetch inventory activities');
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to fetch inventory activities';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  return {
    activities,
    loading,
    error,
    refetch: fetchActivities,
  };
};
