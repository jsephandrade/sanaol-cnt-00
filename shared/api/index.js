// Shared API bundle re-exporting web client, schemas, and service singletons.
// Keeps source of truth in src/api while enabling mobile to import the same helpers.

import apiClient, { ApiClient } from '../../src/api/client.js';
import * as schemas from '../../src/api/schemas/index.js';
import * as mappers from '../../src/api/mappers/index.js';
import generatedOperations, {
  callOperation as callGeneratedOperation,
  createEndpointCaller,
} from './generated/endpoints.js';

import analyticsService from '../../src/api/services/analyticsService.js';
import attendanceService from '../../src/api/services/attendanceService.js';
import authService from '../../src/api/services/authService.js';
import cateringService from '../../src/api/services/cateringService.js';
import dashboardService from '../../src/api/services/dashboardService.js';
import employeeService from '../../src/api/services/employeeService.js';
import feedbackService from '../../src/api/services/feedbackService.js';
import inventoryService from '../../src/api/services/inventoryService.js';
import logsService from '../../src/api/services/logsService.js';
import menuService from '../../src/api/services/menuService.js';
import notificationsService from '../../src/api/services/notificationsService.js';
import orderService from '../../src/api/services/orderService.js';
import paymentsService from '../../src/api/services/paymentsService.js';
import userService from '../../src/api/services/userService.js';
import verificationService from '../../src/api/services/verificationService.js';

export { apiClient, ApiClient, schemas, mappers };
export {
  generatedOperations as operations,
  callGeneratedOperation as callOperation,
  createEndpointCaller,
};

export {
  analyticsService,
  attendanceService,
  authService,
  cateringService,
  dashboardService,
  employeeService,
  feedbackService,
  inventoryService,
  logsService,
  menuService,
  notificationsService,
  orderService,
  paymentsService,
  userService,
  verificationService,
};

export const services = {
  analytics: analyticsService,
  attendance: attendanceService,
  auth: authService,
  catering: cateringService,
  dashboard: dashboardService,
  employees: employeeService,
  feedback: feedbackService,
  inventory: inventoryService,
  logs: logsService,
  menu: menuService,
  notifications: notificationsService,
  orders: orderService,
  payments: paymentsService,
  users: userService,
  verification: verificationService,
};

export * from '../../src/api/schemas/index.js';
export * from '../../src/api/mappers/index.js';

export default apiClient;
