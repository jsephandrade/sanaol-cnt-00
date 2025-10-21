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
  uploadProfileAvatar,
} from './api';
import { useApiConfig } from '../context/ApiContext';

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

function useApiQuery(queryKey, queryFn, options = {}) {
  const { setLastError } = useApiConfig() ?? {};
  return useQuery({
    queryKey,
    queryFn: async () => {
      try {
        return await queryFn();
      } catch (error) {
        setLastError?.(error);
        throw error;
      }
    },
    ...options,
  });
}

function useApiMutation(mutationFn, options = {}) {
  const { setLastError } = useApiConfig() ?? {};
  return useMutation({
    mutationFn: async (variables) => {
      try {
        return await mutationFn(variables);
      } catch (error) {
        setLastError?.(error);
        throw error;
      }
    },
    ...options,
  });
}

export function useCurrentUser(options = {}) {
  return useApiQuery(queryKeys.me, () => getCurrentUser(), options);
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useApiMutation(updateProfile, {
    onSuccess: (user) => {
      queryClient.setQueryData(queryKeys.me, user);
    },
  });
}

export function useUploadAvatar() {
  const queryClient = useQueryClient();
  return useApiMutation(uploadProfileAvatar, {
    onSuccess: (user) => {
      queryClient.setQueryData(queryKeys.me, user);
    },
  });
}

export function useInventoryItems(params) {
  return useApiQuery(queryKeys.inventory.list(params), () =>
    fetchInventory(params || {})
  );
}

export function useUpdateInventoryItem() {
  const queryClient = useQueryClient();
  return useApiMutation(({ id, payload }) => updateInventoryItem(id, payload), {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
    },
  });
}

export function useOrders(params) {
  return useApiQuery(queryKeys.orders.list(params), () => fetchOrders(params));
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useApiMutation(({ id, payload }) => updateOrderStatus(id, payload), {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
    },
  });
}

export function usePayments(params) {
  return useApiQuery(queryKeys.payments.list(params), () =>
    fetchPayments(params)
  );
}

export function useCreatePayment() {
  const queryClient = useQueryClient();
  return useApiMutation(createPayment, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.all });
    },
  });
}

export function useRefundPayment() {
  const queryClient = useQueryClient();
  return useApiMutation(refundPayment, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.all });
    },
  });
}
