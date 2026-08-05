import mongoose from 'mongoose';
import { NOTIFICATION_STATUSES } from '../constants/statuses.js';

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      required: true, // e.g. "application_submitted", "status_changed"
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(NOTIFICATION_STATUSES),
      default: NOTIFICATION_STATUSES.UNREAD,
    },
    relatedJob: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Notification', notificationSchema);
