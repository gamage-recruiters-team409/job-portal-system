import mongoose from "mongoose";

const supportMessageSchema = new mongoose.Schema(
  {
    fullName: {
  type: String,
  required: true,
  trim: true,
  maxlength: 50,
},

email: {
  type: String,
  required: true,
  trim: true,
  lowercase: true,
},

subject: {
  type: String,
  required: true,
  trim: true,
  maxlength: 100,
},

message: {
  type: String,
  required: true,
  trim: true,
  maxlength: 1000,
},

role: {
  type: String,
  enum: ["jobSeeker", "employer"],
  required: true,
},
    status: {
      type: String,
      enum: ["pending", "resolved"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);


const SupportMessage = mongoose.model(
  "SupportMessage",
  supportMessageSchema
);


export default SupportMessage;