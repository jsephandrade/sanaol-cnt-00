import AsyncStorage from '@react-native-async-storage/async-storage';

import { API_CONFIG } from './config';

const USER_CACHE_KEY = '@sanaol/auth/user';

const initialUser = {
  id: 'mock-user-001',
  email: 'demo@sanaol.app',
  first_name: 'Demo',
  last_name: 'User',
  name: 'Demo User',
  role: 'customer',
  phone_number: '+63 912 345 6789',
  campus: 'Main Campus',
  credit_points: 42.5,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  avatar_url:
    'https://ui-avatars.com/api/?name=Demo+User&background=FF8C00&color=fff',
};

const initialInventory = [
  {
    id: 'INV-1001',
    name: 'Classic Beef Tapa Rice',
    sku: 'INV-1001',
    category: 'Meals',
    stock_level: 34,
    unit: 'serving',
    price: '120.00',
    currency: 'PHP',
    expiry_date: '2025-12-30',
    updated_at: new Date().toISOString(),
  },
  {
    id: 'INV-1002',
    name: 'Chicken Adobo Rice Bowl',
    sku: 'INV-1002',
    category: 'Meals',
    stock_level: 18,
    unit: 'serving',
    price: '110.00',
    currency: 'PHP',
    expiry_date: '2025-11-20',
    updated_at: new Date().toISOString(),
  },
  {
    id: 'INV-2001',
    name: 'Iced Caramel Latte',
    sku: 'INV-2001',
    category: 'Beverages',
    stock_level: 52,
    unit: 'cup',
    price: '85.00',
    currency: 'PHP',
    expiry_date: '2025-07-05',
    updated_at: new Date().toISOString(),
  },
];

const initialOrders = [
  {
    id: 'ORD-5001',
    reference_number: '2025-04-001',
    status: 'preparing',
    total_amount: '230.00',
    currency: 'PHP',
    placed_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    fulfillment_eta: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    placed_by: {
      id: initialUser.id,
      name: initialUser.name,
      email: initialUser.email,
    },
    line_items: [
      {
        id: 'ORD-5001-L1',
        name: 'Classic Beef Tapa Rice',
        quantity: 1,
        unit_price: '120.00',
        total_price: '120.00',
        sku: 'INV-1001',
      },
      {
        id: 'ORD-5001-L2',
        name: 'Iced Caramel Latte',
        quantity: 1,
        unit_price: '85.00',
        total_price: '85.00',
        sku: 'INV-2001',
      },
    ],
    notes: 'Less ice on the latte, please.',
  },
  {
    id: 'ORD-4003',
    reference_number: '2025-03-045',
    status: 'completed',
    total_amount: '165.00',
    currency: 'PHP',
    placed_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    fulfilled_at: new Date(
      Date.now() - 2 * 24 * 60 * 60 * 1000 + 40 * 60 * 1000
    ).toISOString(),
    placed_by: {
      id: initialUser.id,
      name: initialUser.name,
      email: initialUser.email,
    },
    line_items: [
      {
        id: 'ORD-4003-L1',
        name: 'Chicken Adobo Rice Bowl',
        quantity: 1,
        unit_price: '110.00',
        total_price: '110.00',
        sku: 'INV-1002',
      },
      {
        id: 'ORD-4003-L2',
        name: 'Bottled Water',
        quantity: 1,
        unit_price: '25.00',
        total_price: '25.00',
        sku: 'INV-3003',
      },
    ],
  },
];

const initialPayments = [
  {
    id: 'PAY-9001',
    order_id: 'ORD-5001',
    status: 'paid',
    amount: '205.00',
    currency: 'PHP',
    method: 'gcash',
    reference: 'GCASH-20250418-001',
    processed_at: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
  },
  {
    id: 'PAY-8502',
    order_id: 'ORD-4003',
    status: 'paid',
    amount: '165.00',
    currency: 'PHP',
    method: 'cash',
    reference: 'CASH-20250316-045',
    processed_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const mockDb = {
  user: { ...initialUser },
  inventory: initialInventory.map((item) => ({ ...item })),
  orders: initialOrders.map((order) => ({
    ...order,
    line_items: order.line_items.map((line) => ({ ...line })),
  })),
  payments: initialPayments.map((payment) => ({ ...payment })),
};

const delay = (ms = API_CONFIG.mockDelay) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const clone = (value) => JSON.parse(JSON.stringify(value));

const mutateUser = (updates = {}) => {
  mockDb.user = {
    ...mockDb.user,
    ...updates,
    updated_at: new Date().toISOString(),
  };
  return mockDb.user;
};

const randomId = (prefix) =>
  `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

export function resetMockDatabase() {
  mockDb.user = { ...initialUser };
  mockDb.inventory = initialInventory.map((item) => ({ ...item }));
  mockDb.orders = initialOrders.map((order) => ({
    ...order,
    line_items: order.line_items.map((line) => ({ ...line })),
  }));
  mockDb.payments = initialPayments.map((payment) => ({ ...payment }));
}

export async function mockLogin({ email }) {
  await delay();
  const user = mutateUser({
    email: email?.trim().toLowerCase() || mockDb.user.email,
  });
  return {
    user: clone(user),
    tokens: {
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
    },
    meta: {
      message: 'Signed in using mock data.',
      success: true,
    },
  };
}

export async function mockLoginWithGoogle({ email }) {
  await delay();
  const user = mutateUser({
    email: email || mockDb.user.email,
    name: mockDb.user.name || 'Google User',
  });
  return {
    success: true,
    pending: false,
    user: clone(user),
    token: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    meta: { message: 'Google login completed (mock).' },
  };
}

export async function mockLogout() {
  await delay(150);
  return { success: true };
}

export async function mockRegisterAccount(payload) {
  await delay();
  const user = mutateUser({
    ...payload,
    id: payload?.id || mockDb.user.id,
    name:
      payload?.name ||
      [payload?.first_name, payload?.last_name].filter(Boolean).join(' ') ||
      mockDb.user.name,
    role: payload?.role || 'customer',
  });
  return {
    data: clone(user),
    meta: { message: 'Account registered (mock).' },
    success: true,
  };
}

export async function mockRequestPasswordReset(payload) {
  await delay();
  return {
    data: { email: payload?.email },
    meta: { message: 'Password reset email queued (mock).' },
  };
}

export async function mockGetCurrentUser() {
  await delay();
  const cached = await AsyncStorage.getItem(USER_CACHE_KEY);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (error) {
      // fall through to in-memory copy
    }
  }
  return clone(mockDb.user);
}

export async function mockUpdateProfile(payload) {
  await delay();
  const user = mutateUser(payload);
  await AsyncStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
  return clone(user);
}

export async function mockFetchInventory() {
  await delay();
  return clone(mockDb.inventory);
}

export async function mockUpdateInventoryItem(itemId, payload) {
  await delay();
  const index = mockDb.inventory.findIndex((item) => item.id === itemId);
  if (index === -1) {
    throw new Error('Inventory item not found.');
  }
  mockDb.inventory[index] = {
    ...mockDb.inventory[index],
    ...payload,
    updated_at: new Date().toISOString(),
  };
  return clone(mockDb.inventory[index]);
}

export async function mockFetchOrders() {
  await delay();
  return clone(mockDb.orders);
}

export async function mockUpdateOrderStatus(orderId, payload) {
  await delay();
  const index = mockDb.orders.findIndex((order) => order.id === orderId);
  if (index === -1) {
    throw new Error('Order not found.');
  }
  mockDb.orders[index] = {
    ...mockDb.orders[index],
    ...payload,
    updated_at: new Date().toISOString(),
  };
  return clone(mockDb.orders[index]);
}

export async function mockFetchPayments() {
  await delay();
  return clone(mockDb.payments);
}

export async function mockCreatePayment(payload) {
  await delay();
  const payment = {
    id: randomId('PAY'),
    order_id: payload?.order_id || payload?.orderId || randomId('ORD'),
    status: 'paid',
    amount: String(payload?.amount ?? '0.00'),
    currency: payload?.currency || 'PHP',
    method: payload?.method || 'cash',
    reference: payload?.reference || randomId('REF'),
    processed_at: new Date().toISOString(),
  };
  mockDb.payments.unshift(payment);
  return clone(payment);
}

export async function mockRefundPayment(paymentId) {
  await delay();
  const index = mockDb.payments.findIndex(
    (payment) => payment.id === paymentId
  );
  if (index === -1) {
    throw new Error('Payment not found.');
  }
  mockDb.payments[index] = {
    ...mockDb.payments[index],
    status: 'refunded',
    refunded_at: new Date().toISOString(),
  };
  return clone(mockDb.payments[index]);
}
