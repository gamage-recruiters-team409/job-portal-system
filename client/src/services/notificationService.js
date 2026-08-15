import apiClient from './apiClient.js';

export const notificationService = {
  async getNotifications(page = 1, limit = 20) {
    try {
      const response = await apiClient.get('/notifications', {
        params: { page, limit },
      });

      if (response.data && response.data.success) {
        return {
          notifications: response.data.data.notifications || [],
          pagination: response.data.data.pagination || {
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 1,
          },
        };
      }

      throw new Error('Failed to retrieve notifications.');
    } catch (error) {
      console.error('API Error [getNotifications]:', error);
      throw new Error('Unable to load notifications at this time. Please try again.', {
        cause: error,
      });
    }
  },

  async markAsRead(notificationId) {
    if (!notificationId) {
      throw new Error('Notification ID is required.');
    }

    try {
      const response = await apiClient.patch(`/notifications/${notificationId}/read`);

      if (response.data && response.data.success) {
        return response.data.data;
      }

      throw new Error('Failed to update notification status.');
    } catch (error) {
      console.error(`API Error [markAsRead - ID: ${notificationId}]:`, error);
      throw new Error('Failed to mark notification as read. Please try again.', { cause: error });
    }
  },
};

export default notificationService;
