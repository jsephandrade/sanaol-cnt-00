const ordersData = require('./ordersData.json');

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const clone = (payload) => JSON.parse(JSON.stringify(payload));

export async function fetchCurrentOrder() {
  await delay(250);
  return clone(ordersData.currentOrder);
}

export async function fetchOrderHistory() {
  await delay(320);
  return clone(ordersData.pastOrders);
}

export async function createSupportTicket(orderId) {
  await delay(220);
  if (!orderId) {
    throw new Error('Missing order reference.');
  }
  return {
    orderId,
    ticketId: `SUP-${Math.floor(Math.random() * 9000 + 1000)}`,
    submittedAt: new Date().toISOString(),
    status: 'open',
  };
}
