import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import menuService from '@/api/services/menuService';

export const useMenuManagement = (params = {}) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const { toast } = useToast();

  const fetchMenuItems = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await menuService.getMenuItems(params);
      
      if (response.success) {
        setItems(response.data);
        setPagination(response.pagination);
      } else {
        throw new Error('Failed to fetch menu items');
      }
    } catch (error) {
      setError(error.message);
      toast({
        title: 'Error Loading Menu',
        description: 'Failed to load menu items. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, [JSON.stringify(params)]);

  const createMenuItem = async (itemData) => {
    try {
      const response = await menuService.createMenuItem(itemData);
      
      if (response.success) {
        setItems(prev => [...prev, response.data]);
        toast({
          title: 'Menu Item Created',
          description: `${itemData.name} has been added to the menu.`,
        });
        return response.data;
      } else {
        throw new Error('Failed to create menu item');
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

  const updateMenuItem = async (itemId, updates) => {
    try {
      const response = await menuService.updateMenuItem(itemId, updates);
      
      if (response.success) {
        setItems(prev => 
          prev.map(item => 
            item.id === itemId ? { ...item, ...response.data } : item
          )
        );
        toast({
          title: 'Menu Item Updated',
          description: 'Menu item has been updated successfully.',
        });
        return response.data;
      } else {
        throw new Error('Failed to update menu item');
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

  const deleteMenuItem = async (itemId) => {
    try {
      const response = await menuService.deleteMenuItem(itemId);
      
      if (response.success) {
        setItems(prev => prev.filter(item => item.id !== itemId));
        toast({
          title: 'Menu Item Deleted',
          description: 'Menu item has been removed from the menu.',
          variant: 'destructive',
        });
        return true;
      } else {
        throw new Error('Failed to delete menu item');
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

  const updateItemAvailability = async (itemId, available) => {
    try {
      const response = await menuService.updateItemAvailability(itemId, available);
      
      if (response.success) {
        setItems(prev => 
          prev.map(item => 
            item.id === itemId ? { ...item, available } : item
          )
        );
        toast({
          title: 'Availability Updated',
          description: `Menu item is now ${available ? 'available' : 'unavailable'}.`,
        });
        return response.data;
      } else {
        throw new Error('Failed to update availability');
      }
    } catch (error) {
      toast({
        title: 'Error Updating Availability',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const uploadItemImage = async (itemId, imageFile) => {
    try {
      const response = await menuService.uploadItemImage(itemId, imageFile);
      
      if (response.success) {
        setItems(prev => 
          prev.map(item => 
            item.id === itemId ? { ...item, image: response.data.imageUrl } : item
          )
        );
        toast({
          title: 'Image Uploaded',
          description: 'Menu item image has been updated successfully.',
        });
        return response.data;
      } else {
        throw new Error('Failed to upload image');
      }
    } catch (error) {
      toast({
        title: 'Error Uploading Image',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const refetch = () => {
    fetchMenuItems();
  };

  return {
    items,
    loading,
    error,
    pagination,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    updateItemAvailability,
    uploadItemImage,
    refetch,
  };
};

export const useMenuCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await menuService.getCategories();
      
      if (response.success) {
        setCategories(response.data);
      } else {
        throw new Error('Failed to fetch categories');
      }
    } catch (error) {
      setError(error.message);
      toast({
        title: 'Error Loading Categories',
        description: 'Failed to load menu categories. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const refetch = () => {
    fetchCategories();
  };

  return {
    categories,
    loading,
    error,
    refetch,
  };
};

export default useMenuManagement;