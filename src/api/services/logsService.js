const mockDelay = (ms = 300) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const SAMPLE_LOGS = [
  {
    id: 'l1',
    action: 'User Login',
    user: 'user@example.com',
    timestamp: Date.now() - 3600_000,
  },
  {
    id: 'l2',
    action: 'Menu Item Added',
    user: 'sarah@example.com',
    timestamp: Date.now() - 7200_000,
  },
  {
    id: 'l3',
    action: 'Inventory Updated',
    user: 'miguel@example.com',
    timestamp: Date.now() - 10800_000,
  },
];

class LogsService {
  async getRecent(limit = 5) {
    await mockDelay(200);
    return { success: true, data: SAMPLE_LOGS.slice(0, limit) };
  }
  async getCount() {
    await mockDelay(150);
    return { success: true, data: { count: SAMPLE_LOGS.length } };
  }
}

export const logsService = new LogsService();
export default logsService;
