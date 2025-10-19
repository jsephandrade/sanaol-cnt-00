import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createPayment,
  fetchInventory,
  fetchOrders,
  fetchPayments,
  getCurrentUser,
  refundPayment,
  updateInventoryItem,
  updateOrderStatus,
  updateProfile,
} from './api';

export const queryKeys = {
  me: ['auth', 'me'],
  inventory: {
    all: ['inventory'],
    list: (params) => ['inventory', 'list', params],
  },
  orders: {
    all: ['orders'],
    list: (params) => ['orders', 'list', params],
  },
  payments: {
    all: ['payments'],
    list: (params) => ['payments', 'list', params],
  },
};

export function useCurrentUser(options = {}) {
  return useQuery({
    queryKey: queryKeys.me,
    queryFn: () => getCurrentUser(),
    ...options,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (user) => {
      queryClient.setQueryData(queryKeys.me, user);
    },
  });
}

export function useInventoryItems(params) {
  return useQuery({
    queryKey: queryKeys.inventory.list(params),
    queryFn: () => fetchInventory(params),
  });
}

export function useUpdateInventoryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => updateInventoryItem(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
    },
  });
}

export function useOrders(params) {
  return useQuery({
    queryKey: queryKeys.orders.list(params),
    queryFn: () => fetchOrders(params),
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => updateOrderStatus(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
    },
  });
}

export function usePayments(params) {
  return useQuery({
    queryKey: queryKeys.payments.list(params),
    queryFn: () => fetchPayments(params),
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.all });
    },
  });
}

export function useRefundPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: refundPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.all });
    },
  });
}
