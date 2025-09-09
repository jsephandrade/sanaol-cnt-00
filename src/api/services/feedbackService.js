import { mockFeedback } from '../mockData';

const mockDelay = (ms = 300) =>
  new Promise((resolve) => setTimeout(resolve, ms));

class FeedbackService {
  async getSummary() {
    await mockDelay(200);
    const list = Array.isArray(mockFeedback) ? mockFeedback : [];
    const count = list.length;
    const avg =
      count > 0
        ? list.reduce((s, f) => s + (Number(f.rating) || 0), 0) / count
        : 0;
    return { success: true, data: { average: Number(avg.toFixed(2)), count } };
  }
}

export const feedbackService = new FeedbackService();
export default feedbackService;
