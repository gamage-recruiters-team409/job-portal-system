import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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
      enum: ["Read", "Unread"],
      default: "Unread",
    },
    relatedJob: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);