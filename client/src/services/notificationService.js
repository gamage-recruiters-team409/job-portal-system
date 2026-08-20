import apiClient from './apiClient.js';

export const notificationService = {
  async getNotifications(page = 1, limit = 20, { type, unreadOnly } = {}) {
    try {
      const params = { page, limit };
      if (type) params.type = type;
      if (unreadOnly) params.unreadOnly = 'true';

      const response = await apiClient.get('/notifications', { params });

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

  async markAllAsRead() {
    try {
      const response = await apiClient.patch('/notifications/mark-all-read');

      if (response.data && response.data.success) {
        return response.data.data; // { modifiedCount }
      }

      throw new Error('Failed to mark all notifications as read.');
    } catch (error) {
      console.error('API Error [markAllAsRead]:', error);
      throw new Error('Failed to mark all notifications as read. Please try again.', {
        cause: error,
      });
    }
  },

  async deleteNotification(notificationId) {
    if (!notificationId) {
      throw new Error('Notification ID is required.');
    }

    try {
      const response = await apiClient.delete(`/notifications/${notificationId}`);

      if (response.data && response.data.success) {
        return response.data.data;
      }

      throw new Error('Failed to delete notification.');
    } catch (error) {
      console.error(`API Error [deleteNotification - ID: ${notificationId}]:`, error);
      throw new Error('Failed to delete notification. Please try again.', { cause: error });
    }
  },

  async deleteAllNotifications() {
    try {
      const response = await apiClient.delete('/notifications/delete-all');

      if (response.data && response.data.success) {
        return response.data.data;
      }

      throw new Error('Failed to delete all notifications.');
    } catch (error) {
      console.error('API Error [deleteAllNotifications]:', error);
      throw new Error('Failed to delete all notifications. Please try again.', { cause: error });
    }
  },

  async getUnreadCount() {
    try {
      const response = await apiClient.get('/notifications/unread-count');

      if (response.data && response.data.success) {
        return response.data.data.count ?? 0;
      }

      throw new Error('Failed to retrieve unread count.');
    } catch (error) {
      console.error('API Error [getUnreadCount]:', error);
      throw new Error('Unable to load unread count at this time.', { cause: error });
    }
  },
};

export default notificationService;
