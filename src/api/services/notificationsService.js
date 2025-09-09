import { mockNotifications } from '../mockData';

// Mock delay for realistic API simulation
const mockDelay = (ms = 500) =>
  new Promise((resolve) => setTimeout(resolve, ms));

class NotificationsService {
  async getUnreadCount() {
    await mockDelay(200);
    const count = (mockNotifications || []).filter(
      (n) => !n.isRead && !n.read
    ).length;
    return { success: true, data: { unreadCount: count } };
  }

  async getRecent(limit = 5) {
    await mockDelay(300);
    const list = (mockNotifications || [])
      .slice(0, limit)
      .map((n) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        createdAt: n.createdAt,
      }));
    return { success: true, data: list };
  }
}

export const notificationsService = new NotificationsService();
export default notificationsService;
