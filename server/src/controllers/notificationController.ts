import { Response } from 'express';
import Notification from '../models/Notification';
import { AuthRequest } from '../middleware/authMiddleware';

// @desc    Get real-time notifications for logged-in user
// @route   GET /api/v1/notifications
// @access  Private
export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    let notifications: any[] = await Notification.find({
      $or: [
        { recipientRole: 'all' },
        { recipientRole: userRole },
        { recipientId: userId },
      ],
    }).sort({ createdAt: -1 }).limit(10);

    // Seed initial notifications if collection is empty
    if (notifications.length === 0) {
      const seeded = [
        {
          title: 'New Placement Open',
          message: 'Amazon SDE recruitment drive (24 LPA) is now open for registration.',
          type: 'placement',
          recipientRole: 'all',
        },
        {
          title: 'Assignment Deadline Reminder',
          message: 'SQL Database Indexing assignment is due in 48 hours.',
          type: 'assignment',
          recipientRole: 'student',
        },
        {
          title: 'Attendance Marked',
          message: 'Database Systems lecture attendance session submitted.',
          type: 'attendance',
          recipientRole: 'all',
        },
      ];
      // cast to any to satisfy TypeScript literal vs string union mismatch
      notifications = await Notification.insertMany(seeded as any);
    }

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return res.status(200).json({ success: true, notifications, unreadCount });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching notifications', error: error.message });
  }
};

// @desc    Mark notification as read
// @route   PATCH /api/v1/notifications/:id/read
// @access  Private
export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndUpdate(id, { isRead: true });
    return res.status(200).json({ success: true, message: 'Notification marked as read.' });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error updating notification', error: error.message });
  }
};