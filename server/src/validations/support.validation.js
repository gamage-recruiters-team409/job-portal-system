import { z } from "zod";

export const supportValidationSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name is required"),

  email: z
    .string()
    .email("Invalid email address"),

  subject: z
    .string()
    .min(3, "Subject is required"),

  message: z
    .string()
    .min(5, "Message is required"),

  role: z.enum([
    "jobSeeker",
    "employer"
  ]),
});