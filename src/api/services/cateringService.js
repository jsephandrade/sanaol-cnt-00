import { mockCateringOrders } from '../mockData';

const mockDelay = (ms = 500) =>
  new Promise((resolve) => setTimeout(resolve, ms));

class CateringService {
  async getUpcoming(limit = 5) {
    await mockDelay(300);
    const now = new Date();
    const list = (mockCateringOrders || [])
      .filter((e) => {
        const d = new Date(e.eventDate || now);
        // Treat confirmed/future as upcoming
        return (e.status || '').toLowerCase() === 'confirmed' || d >= now;
      })
      .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate))
      .slice(0, limit)
      .map((e) => ({
        id: e.id,
        name: e.eventName,
        date: e.eventDate,
        client: e.clientName,
      }));
    return { success: true, data: list };
  }
}

export const cateringService = new CateringService();
export default cateringService;
