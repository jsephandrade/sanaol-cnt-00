import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import orderService from '@/api/services/orderService';

export const useOrderManagement = (params = {}) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const { toast } = useToast();

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await orderService.getOrders(params);
      
      if (response.success) {
        setOrders(response.data);
        setPagination(response.pagination);
      } else {
        throw new Error('Failed to fetch orders');
      }
    } catch (error) {
      setError(error.message);
      toast({
        title: 'Error Loading Orders',
        description: 'Failed to load orders. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [JSON.stringify(params)]);

  const createOrder = async (orderData) => {
    try {
      const response = await orderService.createOrder(orderData);
      
      if (response.success) {
        setOrders(prev => [...prev, response.data]);
        toast({
          title: 'Order Created',
          description: `Order ${response.data.orderNumber} has been created successfully.`,
        });
        return response.data;
      } else {
        throw new Error('Failed to create order');
      }
    } catch (error) {
      toast({
        title: 'Error Creating Order',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const response = await orderService.updateOrderStatus(orderId, status);
      
      if (response.success) {
        setOrders(prev => 
          prev.map(order => 
            order.id === orderId ? { ...order, ...response.data } : order
          )
        );
        
        const statusText = {
          'pending': 'pending',
          'preparing': 'preparing',
          'ready': 'ready for pickup',
          'completed': 'completed',
          'cancelled': 'cancelled'
        }[status];
        
        toast({
          title: 'Order Status Updated',
          description: `Order is now ${statusText}.`,
        });
        return response.data;
      } else {
        throw new Error('Failed to update order status');
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

  const cancelOrder = async (orderId, reason) => {
    try {
      const response = await orderService.cancelOrder(orderId, reason);
      
      if (response.success) {
        setOrders(prev => 
          prev.map(order => 
            order.id === orderId ? { ...order, status: 'cancelled' } : order
          )
        );
        toast({
          title: 'Order Cancelled',
          description: 'Order has been cancelled successfully.',
          variant: 'destructive',
        });
        return true;
      } else {
        throw new Error('Failed to cancel order');
      }
    } catch (error) {
      toast({
        title: 'Error Cancelling Order',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const processPayment = async (orderId, paymentData) => {
    try {
      const response = await orderService.processPayment(orderId, paymentData);
      
      if (response.success) {
        setOrders(prev => 
          prev.map(order => 
            order.id === orderId ? { 
              ...order, 
              paymentMethod: paymentData.method,
              status: order.status === 'pending' ? 'preparing' : order.status
            } : order
          )
        );
        toast({
          title: 'Payment Processed',
          description: `Payment of ₱${paymentData.amount.toFixed(2)} processed successfully.`,
        });
        return response.data;
      } else {
        throw new Error('Failed to process payment');
      }
    } catch (error) {
      toast({
        title: 'Payment Failed',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const refetch = () => {
    fetchOrders();
  };

  return {
    orders,
    loading,
    error,
    pagination,
    createOrder,
    updateOrderStatus,
    cancelOrder,
    processPayment,
    refetch,
  };
};

export const useOrderQueue = (params = {}) => {
  const [orderQueue, setOrderQueue] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  const fetchOrderQueue = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await orderService.getOrderQueue(params);
      
      if (response.success) {
        setOrderQueue(response.data);
      } else {
        throw new Error('Failed to fetch order queue');
      }
    } catch (error) {
      setError(error.message);
      toast({
        title: 'Error Loading Queue',
        description: 'Failed to load order queue. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderQueue();
  }, [JSON.stringify(params)]);

  const updateOrderStatus = async (orderId, status) => {
    try {
      const response = await orderService.updateOrderStatus(orderId, status);
      
      if (response.success) {
        setOrderQueue(prev => 
          prev.map(order => 
            order.id === orderId ? { ...order, ...response.data } : order
          )
        );
        return response.data;
      } else {
        throw new Error('Failed to update order status');
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

  const refetch = () => {
    fetchOrderQueue();
  };

  return {
    orderQueue,
    loading,
    error,
    updateOrderStatus,
    refetch,
  };
};

export const useOrderHistory = (params = {}) => {
  const [orderHistory, setOrderHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const { toast } = useToast();

  const fetchOrderHistory = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await orderService.getOrderHistory(params);
      
      if (response.success) {
        setOrderHistory(response.data);
        setPagination(response.pagination);
      } else {
        throw new Error('Failed to fetch order history');
      }
    } catch (error) {
      setError(error.message);
      toast({
        title: 'Error Loading History',
        description: 'Failed to load order history. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderHistory();
  }, [JSON.stringify(params)]);

  const refetch = () => {
    fetchOrderHistory();
  };

  return {
    orderHistory,
    loading,
    error,
    pagination,
    refetch,
  };
};

export default useOrderManagement;